# Taipei Vanguard — Tactical R2 (2026-11-20)

這次更新直接針對三個問題：敵人不會跑閃、人物像方塊、Interact 後又生怪。

## 本版玩法

- 預設戰役：所有敵人在開局就部署完成。打倒後本局不再補生。第12關的重裝敵人也在開局就在場。
- Interact 只處理解救、裝置與任務點。戰役進行中，新增敵人的入口會被鎖住。
- 第8、12關的防守波次移到另外的 OPTIONAL: THREE-WAVE DEFENSE DRILL 按鈕；一般 DEPLOY 不會進入防守波次。防守演練不解鎖戰役進度。
- 敵人會追擊跑動、側移、受火後延遲閃避、尋找附近遮蔽物、繞過障礙物，並以短點射攻擊。沒有上下亂跳。
- 人物改為帶貼圖、49根骨骼的士兵模型，使用 Idle / Walk / Run 骨架動畫與動作銜接。倒地後保留，身體最低點落在地面。
- 換彈有時間；加入3D前景槍械、瞄準視野、後座視覺與較簡潔的戰術介面。

## 更新 GitHub 網站

1. 解壓縮完整 ZIP。
2. 將裡面的全部檔案及資料夾上傳到 Repository 根目錄，包含 assets/models、vendor、enemy-ai.js、scene-geometry.js、renderer3d.js、game.js、tactical.css 及 index.html。不要只換 game.js。
3. 完成 Commit，等待 GitHub Pages 更新後重新整理。右上方必須顯示 TACTICAL R2 · NO RESPAWN，才能確認載入本版。

這份交付是更新檔案，沒有直接修改 GitHub 遠端或自動部署網站。入口檔替腳本與樣式加上版本網址，避免沿用上一版快取。遊戲透過靜態網站載入；不要用受限的檔案預覽器開啟 index.html。

## 操作

iPad橫向：左側移動，右側拖曳瞄準，FIRE / AIM / RELOAD / INTERACT。
桌面：WASD移動、方向鍵轉向、Space開火、R換彈、F互動、Esc暫停。雙擊右側視野區可鎖定滑鼠，之後用滑鼠移動瞄準、左鍵開火；Esc可離開。

## 驗證

25項邏輯、流程及AI測試通過。Chromium 157 中驗證八景點的貼圖骨架人物、12關戰役完成且每關只部署一次、兩個明確選擇的防守演練、跑步骨骼改變、側閃位移、24組倒地接地案例，以及鍵盤與模擬觸控 Interact。執行時沒有外部網路資源請求，也沒有瀏覽器或WebGL錯誤。

邏輯測試：node --test tests/mission-flow.test.cjs
瀏覽器測試：node tests/tactical-browser.cjs（需Playwright與Chrome/Chromium；可指定CHROME_PATH）
詳細結果見 tests/mission-results.tap 與 tests/tactical-browser-results.json。

## 現階段限制

這是更換人物與戰鬥系統的戰術原型，尚未達到 Counter-Strike 的成品品質。八個景點仍是前一版的簡化建築與局部配置，槍械模型和死亡倒地不是正式武器素材或完整物理布娃娃；尚未完成iPad Safari實機效能、戰鬥平衡與操控驗證。自動通關使用測試位置與額外護甲來隔離流程問題，不等於人工無輔助通關。

模型與第三方程式來源請見 THIRD_PARTY_NOTICES.md；景點資料見 SCENE_REFERENCES.md。
