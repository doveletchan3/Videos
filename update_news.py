#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto-updater for CTV News Vancouver at Six & Local Vancouver News
Fetches the latest broadcasts directly from Bell Media's 9c9media platform
and updates data/videos.json automatically.
"""

import json
import os
import sys
import re
import urllib.request
from datetime import datetime

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

WEEKDAY_MAP = {
    'Monday': '一',
    'Tuesday': '二',
    'Wednesday': '三',
    'Thursday': '四',
    'Friday': '五',
    'Saturday': '六',
    'Sunday': '日'
}

def format_ep_name(title):
    # e.g. "CTV News Vancouver at Six for Wednesday, Oct. 14, 2026"
    # Or "CTV News Vancouver at Six for Friday, Oct. 9, 2026"
    m = re.search(r'for\s+([A-Za-z]+),\s+([A-Za-z.]+)\s+(\d+)', title)
    if m:
        wday_en = m.group(1)
        mon_en = m.group(2).replace('.', '')
        day = m.group(3).zfill(2)
        wday = WEEKDAY_MAP.get(wday_en, '')
        
        month_map = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Sept': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }
        month = month_map.get(mon_en[:3], '')
        if month:
            return f"{month}月{day}日 ({wday})" if wday else f"{month}月{day}日"
    return title

def update_news():
    api_url = 'http://capi.9c9media.com/destinations/ctvnews_web/platforms/desktop/collections/11658/contents?page=1&pageSize=14'
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    
    print(f"Fetching CTV Collection 11658 from {api_url}...")
    with urllib.request.urlopen(req, timeout=12) as resp:
        data = json.load(resp)
        items = data.get('Items', [])
    
    if not items:
        print("No items returned from CTV API.")
        return False
        
    print(f"Retrieved {len(items)} CTV News Vancouver at Six episodes.")
    
    ctv_web_episodes = []
    for it in items:
        aid = it.get('Id')
        title = it.get('Name') or f"CTV News Vancouver at Six (Id: {aid})"
        name = format_ep_name(title)
        ctv_web_episodes.append({
            "name": name,
            "url": f"https://www.ctvnews.ca/vancouver/video/?id={aid}"
        })
        
    videos_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'videos.json')
    with open(videos_file, 'r', encoding='utf-8') as f:
        videos = json.load(f)
        
    updated = False
    for v in videos:
        if str(v.get('id')) in ['11658', '11659']:
            for s in v.get('sources', []):
                if 'ctv_van_at_six_web' in s.get('source_id', ''):
                    s['episodes'] = ctv_web_episodes
                    s['episode_count'] = len(ctv_web_episodes)
                    updated = True
            v['updatedAt'] = datetime.now().isoformat()
            
    if updated:
        with open(videos_file, 'w', encoding='utf-8') as f:
            json.dump(videos, f, ensure_ascii=False, indent=2)
        print(f"Successfully updated data/videos.json with {len(ctv_web_episodes)} episodes.")
        print(f"Latest episode: {ctv_web_episodes[0]['name']}")
        return True
    else:
        print("No matching video entries found in videos.json.")
        return False

if __name__ == '__main__':
    success = update_news()
    sys.exit(0 if success else 1)
