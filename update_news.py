#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto-updater for CTV News Vancouver at Six
Fetches the latest broadcasts from both:
1. CTV Official Web Platform (9c9media) -> 線路1
2. CTV Official YouTube Channel -> 線路2 (Pure Video Fullscreen)
and updates data/videos.json automatically.
"""

import json
import os
import sys
import re
import urllib.request
import urllib.parse
from datetime import datetime, date

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

WEEKDAY_MAP = {
    'Monday': '一', 'Tuesday': '二', 'Wednesday': '三',
    'Thursday': '四', 'Friday': '五', 'Saturday': '六', 'Sunday': '日',
    'Mon': '一', 'Tue': '二', 'Wed': '三', 'Thu': '四', 'Fri': '五', 'Sat': '六', 'Sun': '日'
}

MONTH_MAP = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'sept': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

def parse_ep_name_and_sort_key(title):
    # Pattern 1: e.g. "CTV News Vancouver at Six for Thursday, Oct. 15"
    m1 = re.search(r'for\s+([A-Za-z]+),\s+([A-Za-z.]+)\s+(\d+)(?:,\s*(\d{4}))?', title, re.IGNORECASE)
    if m1:
        wday_raw = m1.group(1).capitalize()
        mon_raw = m1.group(2).replace('.', '').lower()[:3]
        day = m1.group(3).zfill(2)
        year = m1.group(4) or str(datetime.now().year)
        wday = WEEKDAY_MAP.get(wday_raw, '')
        mon = MONTH_MAP.get(mon_raw, '')
        if mon:
            name = f"{mon}月{day}日 ({wday})" if wday else f"{mon}月{day}日"
            sort_key = f"{year}{mon}{day}"
            return name, sort_key

    # Pattern 2: e.g. "CTV News Vancouver at Six for Oct. 14, 2026"
    m2 = re.search(r'for\s+([A-Za-z.]+)\s+(\d+)(?:,\s*(\d{4}))?', title, re.IGNORECASE)
    if m2:
        mon_raw = m2.group(1).replace('.', '').lower()[:3]
        day = m2.group(2).zfill(2)
        year = m2.group(3) or str(datetime.now().year)
        mon = MONTH_MAP.get(mon_raw, '')
        if mon:
            try:
                dt = date(int(year), int(mon), int(day))
                w_num = dt.weekday()
                w_cn = ['一', '二', '三', '四', '五', '六', '日'][w_num]
                name = f"{mon}月{day}日 ({w_cn})"
            except Exception:
                name = f"{mon}月{day}日"
            sort_key = f"{year}{mon}{day}"
            return name, sort_key

    return title, "00000000"

def fetch_ctv_web_episodes(max_eps=5):
    api_url = f'http://capi.9c9media.com/destinations/ctvnews_web/platforms/desktop/collections/11658/contents?page=1&pageSize={max_eps}'
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    print(f"[CTV 官網] 正在從 9c9media 獲取最新 {max_eps} 期官方原頁新聞...")
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.load(resp)
            items = data.get('Items', [])
    except Exception as e:
        print(f"[CTV 官網] 獲取失敗: {e}")
        return []

    episodes = []
    for it in items[:max_eps]:
        aid = it.get('Id')
        title = it.get('Name') or f"CTV News Vancouver at Six (Id: {aid})"
        name, _ = parse_ep_name_and_sort_key(title)
        episodes.append({
            "name": name,
            "url": f"https://www.ctvnews.ca/vancouver/video/?id={aid}"
        })
    print(f"[CTV 官網] 成功取得 {len(episodes)} 期節目。最新: {episodes[0]['name'] if episodes else '無'}")
    return episodes

def fetch_youtube_episodes(max_eps=5):
    query = 'CTV News Vancouver at Six'
    url = f'https://www.youtube.com/results?search_query={urllib.parse.quote_plus(query)}&sp=CAI%253D'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    print(f"[YouTube] 正在從官方頻道獲取最新 {max_eps} 期滿版純影片新聞...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[YouTube] 請求失敗: {e}")
        return []

    m = re.search(r'var ytInitialData = ({.*?});</script>', html)
    if not m:
        m = re.search(r'ytInitialData = ({.*?});', html)
    if not m:
        print("[YouTube] 未找到數據結構")
        return []

    try:
        data = json.loads(m.group(1))
    except Exception as e:
        print(f"[YouTube] 解析 JSON 失敗: {e}")
        return []

    def find_videos(obj):
        videos = []
        if isinstance(obj, dict):
            if 'videoRenderer' in obj:
                vr = obj['videoRenderer']
                vid = vr.get('videoId')
                title = vr.get('title', {}).get('runs', [{}])[0].get('text', '')
                owner = vr.get('ownerText', {}).get('runs', [{}])[0].get('text', '')
                videos.append({'id': vid, 'title': title, 'owner': owner})
            for v in obj.values():
                videos.extend(find_videos(v))
        elif isinstance(obj, list):
            for it in obj:
                videos.extend(find_videos(it))
        return videos

    raw_vids = find_videos(data)
    candidates = []
    seen_ids = set()

    for v in raw_vids:
        title = v['title']
        owner = v['owner']
        vid = v['id']
        if not vid or vid in seen_ids:
            continue
        if 'vancouver at six' in title.lower() and ('ctv' in owner.lower() or 'ctv' in title.lower()):
            seen_ids.add(vid)
            name, sort_key = parse_ep_name_and_sort_key(title)
            candidates.append({
                "name": name,
                "url": f"https://www.youtube-nocookie.com/embed/{vid}?autoplay=1",
                "title": title,
                "sort_key": sort_key
            })

    # Sort descending by date
    candidates.sort(key=lambda x: x['sort_key'], reverse=True)

    results = []
    for c in candidates[:max_eps]:
        results.append({
            "name": c['name'],
            "url": c['url'],
            "title": c['title']
        })

    print(f"[YouTube] 成功取得 {len(results)} 期節目。最新: {results[0]['name'] if results else '無'}")
    return results

def update_news():
    ctv_web_episodes = fetch_ctv_web_episodes(5)
    yt_episodes = fetch_youtube_episodes(5)

    if not ctv_web_episodes and not yt_episodes:
        print("未獲取到任何新聞節目，終止更新。")
        return False

    videos_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'videos.json')
    with open(videos_file, 'r', encoding='utf-8') as f:
        videos = json.load(f)

    updated = False
    for v in videos:
        if str(v.get('id')) == '11658':
            for s in v.get('sources', []):
                # Update 線路1: CTV 官網原頁
                if 'ctv_van_at_six_web' in s.get('source_id', ''):
                    if ctv_web_episodes:
                        s['name'] = f"線路1 - CTV 溫哥華官網原頁 (Vancouver at Six {len(ctv_web_episodes)}期完整版 · 雙擊滿版)"
                        s['episodes'] = ctv_web_episodes
                        s['episode_count'] = len(ctv_web_episodes)
                        updated = True
                # Update 線路2: YouTube 滿版純影片
                elif 'ctv_van_at_six_pure' in s.get('source_id', ''):
                    if yt_episodes:
                        s['name'] = f"線路2 - CTV 溫哥華六點新聞 (Vancouver at Six {len(yt_episodes)}期滿版純影片 · 每日焦點)"
                        s['episodes'] = yt_episodes
                        s['episode_count'] = len(yt_episodes)
                        updated = True

            v['updatedAt'] = datetime.now().isoformat()

    if updated:
        with open(videos_file, 'w', encoding='utf-8') as f:
            json.dump(videos, f, ensure_ascii=False, indent=2)
        print("\n✅ 已成功將 CTV 官網原頁 (線路1) 與 YouTube 滿版純影片 (線路2) 同步更新至 data/videos.json！")
        return True
    else:
        print("未在 videos.json 找到目標項目。")
        return False

if __name__ == '__main__':
    success = update_news()
    sys.exit(0 if success else 1)
