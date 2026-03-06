// ==UserScript==
// @name         PerfectMile Caravan – Auto Expand
// @namespace    http://tampermonkey.net/
// @version      1.4
// @contributor  tongwug@
// @ideaprovider hubersve@
// @description  Deep Hierarchy, WoW%, Heatmap, Async Expand, CSV Export, Hide/Show Toolbar
// @match        https://perfectmile.a2z.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const CHECK_INTERVAL_MS = 2000;
    const EXPAND_WAIT_MS    = 1000;
    const CLICK_DELAY_MS    = 50;
    const MAX_RETRIES       = 30;
    const CONTAINER_CLASS   = 'pm-suite-container';
    const TOOLBAR_HIDDEN_KEY = 'pm-suite-toolbar-hidden';

    // --- SYSTEM LOGGER ---
    let logHistory = [];
    function logSystem(msg) {
        const timestamp = new Date().toLocaleTimeString();
        logHistory.push('[' + timestamp + '] ' + msg);
        const logContainer = document.getElementById('pm-log-container');
        if (logContainer) {
            const div = document.createElement('div');
            div.style.marginBottom = '2px';
            div.innerHTML = '<span style="color:#60a5fa">' + timestamp + '</span> ' + msg;
            logContainer.appendChild(div);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
        console.log('[PM Suite] ' + msg);
    }

    // --- UTILS ---
    function parseValue(text) {
        if (!text || text.trim() === '-' || text.trim() === '' || text.trim() === 'N/A') return -999999;
        let clean = text.replace(/,/g, '').replace(/%/g, '').replace(/bps/i, '').trim();
        let num = parseFloat(clean);
        return isNaN(num) ? -999999 : num;
    }

    function calculateWoW(curr, prev) {
        if (curr === -999999 || prev === -999999 || prev === 0) return { text: '-', color: '#9ca3af' };
        const change = ((curr - prev) / prev) * 100;
        const arrow = change > 0 ? '↑' : (change < 0 ? '↓' : '-');
        const color = change > 0 ? '#16a34a' : (change < 0 ? '#dc2626' : '#9ca3af');
        return { text: arrow + ' ' + Math.abs(change).toFixed(1) + '%', color: color };
    }

    function getWeekColumnIndex(table) {
        const headerRow = table.querySelector('thead tr') || table.rows[0];
        if (!headerRow) return -1;
        const cells = Array.from(headerRow.cells);
        const weekRegex = /^W\d{1,2}/;
        const index = cells.findIndex(cell => weekRegex.test(cell.innerText.trim()));
        return index;
    }

    // --- RESET TABLE ROWS ---
    function resetTableRows(table) {
        const rows = Array.from(table.rows);
        rows.forEach(row => {
            row.style.display = '';
            row.style.backgroundColor = '';
            row.style.borderLeft = '';
        });
        logSystem('Reset all table row styles');
    }

    // --- TOAST NOTIFICATION ---
    function showToast(message, duration) {
        duration = duration || 3000;
        const existingToast = document.getElementById('pm-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'pm-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '80px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#1f2937';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        toast.style.zIndex = '10001';
        toast.style.fontSize = '14px';
        toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        toast.style.maxWidth = '400px';
        toast.style.textAlign = 'center';

        toast.innerHTML = '<div style="display:flex; align-items:center; gap:10px;"><span style="font-size:18px;">ℹ️</span><span>' + message + '</span></div>';

        document.body.appendChild(toast);

        setTimeout(function() {
            toast.remove();
        }, duration);
    }

    // --- HIDE/SHOW TOOLBAR FEATURE ---
    function isToolbarHidden() {
        return localStorage.getItem(TOOLBAR_HIDDEN_KEY) === 'true';
    }

    function hideAllToolbars() {
        const toolbars = document.querySelectorAll('.' + CONTAINER_CLASS);
        toolbars.forEach(function(toolbar) {
            toolbar.style.display = 'none';
        });
        localStorage.setItem(TOOLBAR_HIDDEN_KEY, 'true');
        logSystem('Toolbar hidden');
    }

    function showAllToolbars() {
        const toolbars = document.querySelectorAll('.' + CONTAINER_CLASS);
        toolbars.forEach(function(toolbar) {
            toolbar.style.display = 'flex';
        });
        localStorage.setItem(TOOLBAR_HIDDEN_KEY, 'false');
        logSystem('Toolbar visible');
    }

    // --- ATTRIBUTION WITH TOGGLE BUTTON ---
    function injectAttribution() {
        if (document.getElementById('pm-attribution-footer')) return;

        const footer = document.createElement('div');
        footer.id = 'pm-attribution-footer';
        footer.style.position = 'fixed';
        footer.style.bottom = '10px';
        footer.style.right = '10px';
        footer.style.zIndex = '9999';
        footer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        footer.style.padding = '6px 14px';
        footer.style.borderRadius = '20px';
        footer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        footer.style.border = '1px solid #e5e7eb';
        footer.style.fontSize = '11px';
        footer.style.color = '#6b7280';
        footer.style.fontFamily = 'sans-serif';
        footer.style.pointerEvents = 'auto';
        footer.style.display = 'flex';
        footer.style.alignItems = 'center';
        footer.style.gap = '8px';

        footer.innerHTML = '<button id="pm-toggle-toolbar-btn" title="Toggle Toolbar" style="width: 26px; height: 26px; border-radius: 50%; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; padding: 0;">📊</button><span style="color:#d1d5db;">|</span><span>Tool by</span><a href="https://phonetool.amazon.com/users/tongwug" target="_blank" style="color:#2563eb; text-decoration:none; font-weight:700;">Tong Wu</a><span style="opacity:0.5;">(tongwug@)</span>';

        document.body.appendChild(footer);

        const toggleBtn = document.getElementById('pm-toggle-toolbar-btn');

        toggleBtn.addEventListener('click', function() {
            const toolbars = document.querySelectorAll('.' + CONTAINER_CLASS);
            if (toolbars.length === 0) {
                showToast('No toolbar found on this page');
                return;
            }

            const isCurrentlyHidden = toolbars[0].style.display === 'none';

            if (isCurrentlyHidden) {
                showAllToolbars();
                toggleBtn.innerHTML = '📊';
                toggleBtn.title = 'Hide Toolbar';
                showToast('Toolbar visible');
            } else {
                hideAllToolbars();
                toggleBtn.innerHTML = '👁️';
                toggleBtn.title = 'Show Toolbar';
                showToast('Toolbar hidden');
            }
        });

        if (isToolbarHidden()) {
            setTimeout(function() {
                hideAllToolbars();
                toggleBtn.innerHTML = '👁️';
                toggleBtn.title = 'Show Toolbar';
            }, 100);
        }
    }

    // --- DEEP HIERARCHY DETECTION ---
    function getFullHierarchy(row) {
        let path = [];
        let currentName = row.cells[0].innerText.trim().split('\n')[0];
        path.unshift(currentName);

        let currentIndent = 0;
        const firstCell = row.cells[0];
        const style = window.getComputedStyle(firstCell);
        currentIndent = parseFloat(style.paddingLeft) || 0;

        let prev = row.previousElementSibling;
        while (prev) {
            const hasButton = prev.querySelector('button') !== null;
            if (hasButton) {
                const prevCell = prev.cells[0];
                const prevStyle = window.getComputedStyle(prevCell);
                const prevIndent = parseFloat(prevStyle.paddingLeft) || 0;

                if (prevIndent < currentIndent) {
                    const parentName = prev.cells[0].innerText.trim().split('\n')[0];
                    path.unshift(parentName);
                    currentIndent = prevIndent;
                }
            }
            if (currentIndent === 0 && path.length > 1) break;
            prev = prev.previousElementSibling;
        }
        return path.join(' > ');
    }

    // --- SECTION DISCOVERY ---
    function discoverSections(table) {
        const sections = [];
        const rows = Array.from(table.rows);

        rows.forEach(function(row, index) {
            const expandBtn = row.querySelector('button span[aria-label="Expand row"]');
            const collapseBtn = row.querySelector('button span[aria-label="Collapse row"]');

            if (expandBtn || collapseBtn) {
                const name = row.cells[0] ? row.cells[0].innerText.trim().split('\n')[0] : 'Section ' + index;
                const hierarchy = getFullHierarchy(row);
                const isExpanded = collapseBtn !== null;

                sections.push({
                    row: row,
                    rowIndex: index,
                    name: name,
                    hierarchy: hierarchy,
                    isExpanded: isExpanded,
                    button: expandBtn ? expandBtn.closest('button') : collapseBtn.closest('button')
                });
            }
        });

        return sections;
    }

    // --- Helper: Get indent level of a row ---
    function getSectionIndentLevel(row) {
        if (!row || !row.cells || !row.cells[0]) return 0;
        const style = window.getComputedStyle(row.cells[0]);
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        return paddingLeft;
    }

    // --- COLLAPSE ALL SECTIONS ---
    async function collapseAllSections(table) {
        const initialCollapseSpans = table.querySelectorAll('span[aria-label="Collapse row"]');

        if (initialCollapseSpans.length === 0) {
            logSystem('Nothing to collapse - no expanded sections found');
            return 0;
        }

        let totalCollapsed = 0;
        let maxRounds = 1;
        let round = 0;

        logSystem('Starting collapse all... Found ' + initialCollapseSpans.length + ' expanded sections');

        while (round < maxRounds) {
            round++;

            const collapseSpans = Array.from(table.querySelectorAll('span[aria-label="Collapse row"]'));

            if (collapseSpans.length === 0) {
                logSystem('Collapse complete after ' + (round - 1) + ' rounds');
                break;
            }

            logSystem('Round ' + round + ': Collapsing ' + collapseSpans.length + ' sections');

            let clickedThisRound = 0;
            for (const span of collapseSpans) {
                const btn = span.closest('button');
                if (btn && btn.offsetParent !== null && !btn.disabled) {
                    btn.click();
                    clickedThisRound++;
                    totalCollapsed++;
                    await new Promise(function(r) { setTimeout(r, CLICK_DELAY_MS); });
                }
            }

            if (clickedThisRound === 0) {
                logSystem('No buttons were clickable this round, stopping');
                break;
            }

            await new Promise(function(r) { setTimeout(r, EXPAND_WAIT_MS); });
        }

        logSystem('Collapse complete! Total collapsed: ' + totalCollapsed);
        return totalCollapsed;
    }

    // --- EXPAND SELECTED SECTIONS ---
    async function expandSelectedSections(table, sections, onProgress, onComplete) {
        let totalExpanded = 0;
        const total = sections.length;

        logSystem('Starting DEEP expansion of ' + total + ' sections to end nodes...');

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];

            if (onProgress) {
                onProgress(i + 1, total, section.name, 'Starting...');
            }

            logSystem('Processing section ' + (i + 1) + '/' + total + ': ' + section.name);

            const sectionIndent = getSectionIndentLevel(section.row);

            const headerExpandSpan = section.row.querySelector('span[aria-label="Expand row"]');
            if (headerExpandSpan) {
                const btn = headerExpandSpan.closest('button');
                if (btn && btn.offsetParent !== null && !btn.disabled) {
                    btn.click();
                    totalExpanded++;
                    logSystem('Expanded section header: ' + section.name);
                    await new Promise(function(r) { setTimeout(r, EXPAND_WAIT_MS); });
                }
            }

            let round = 0;
            const maxRounds = 50;
            let consecutiveEmptyRounds = 0;

            while (round < maxRounds && consecutiveEmptyRounds < 3) {
                round++;
                let expandedThisRound = 0;

                const allRows = Array.from(table.rows);
                const sectionRowIndex = allRows.indexOf(section.row);

                if (sectionRowIndex === -1) {
                    logSystem('Warning: Could not find section row in table');
                    break;
                }

                const expandButtonsInSection = [];

                for (let j = sectionRowIndex + 1; j < allRows.length; j++) {
                    const row = allRows[j];

                    const rowHasExpandCollapse = row.querySelector('span[aria-label="Expand row"]') ||
                                                  row.querySelector('span[aria-label="Collapse row"]');

                    if (rowHasExpandCollapse) {
                        const rowIndent = getSectionIndentLevel(row);
                        if (rowIndent <= sectionIndent) {
                            break;
                        }
                    }
                                        const expandSpan = row.querySelector('span[aria-label="Expand row"]');
                    if (expandSpan) {
                        const btn = expandSpan.closest('button');
                        if (btn && btn.offsetParent !== null && !btn.disabled) {
                            expandButtonsInSection.push({
                                button: btn,
                                row: row,
                                name: row.cells[0] ? row.cells[0].innerText.trim().split('\n')[0] : 'Unknown'
                            });
                        }
                    }
                }

                if (expandButtonsInSection.length === 0) {
                    consecutiveEmptyRounds++;
                    logSystem('Round ' + round + ': No expand buttons found (empty round ' + consecutiveEmptyRounds + '/3)');
                    await new Promise(function(r) { setTimeout(r, 300); });
                    continue;
                }

                consecutiveEmptyRounds = 0;

                logSystem('Round ' + round + ': Found ' + expandButtonsInSection.length + ' expandable items');

                if (onProgress) {
                    onProgress(i + 1, total, section.name, 'Round ' + round + ': Expanding ' + expandButtonsInSection.length + ' items...');
                }

                for (let k = 0; k < expandButtonsInSection.length; k++) {
                    const item = expandButtonsInSection[k];
                    try {
                        item.button.click();
                        expandedThisRound++;
                        totalExpanded++;
                        await new Promise(function(r) { setTimeout(r, CLICK_DELAY_MS); });
                    } catch (e) {
                        logSystem('Error clicking button: ' + e.message);
                    }
                }

                logSystem('Round ' + round + ': Expanded ' + expandedThisRound + ' items');
                await new Promise(function(r) { setTimeout(r, EXPAND_WAIT_MS); });
            }

            if (onProgress) {
                onProgress(i + 1, total, section.name, '✓ Fully expanded');
            }

            logSystem('Completed section "' + section.name + '" - all nested levels expanded');
        }

        await new Promise(function(r) { setTimeout(r, EXPAND_WAIT_MS); });

        logSystem('=== DEEP EXPANSION COMPLETE === Total: ' + totalExpanded + ' nodes');

        if (onComplete) onComplete(totalExpanded);
    }

    // --- COLLAPSE SELECTED SECTIONS ---
    async function collapseSelectedSections(table, sections, onProgress, onComplete) {
        let totalCollapsed = 0;
        const total = sections.length;

        logSystem('Starting collapse of ' + total + ' sections...');

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];

            if (onProgress) {
                onProgress(i + 1, total, section.name, 'Collapsing...');
            }

            logSystem('Collapsing section ' + (i + 1) + '/' + total + ': ' + section.name);

            const collapseSpan = section.row.querySelector('span[aria-label="Collapse row"]');
            if (collapseSpan) {
                const btn = collapseSpan.closest('button');
                if (btn && btn.offsetParent !== null && !btn.disabled) {
                    btn.click();
                    totalCollapsed++;
                    logSystem('Collapsed section: ' + section.name);
                    await new Promise(function(r) { setTimeout(r, EXPAND_WAIT_MS); });
                }
            }

            if (onProgress) {
                onProgress(i + 1, total, section.name, '✓ Collapsed');
            }
        }

        await new Promise(function(r) { setTimeout(r, EXPAND_WAIT_MS); });

        logSystem('=== COLLAPSE COMPLETE === Total: ' + totalCollapsed + ' sections');

        if (onComplete) onComplete(totalCollapsed);
    }

    // --- DATA EXTRACTION ---
function extractAllSortedData(table, colIndex) {
    logSystem('Analyzing hierarchy...');
    var results = [];
    var headerRows = Array.from(table.rows).filter(function(row) {
        return row.querySelector('button span[aria-label="Collapse row"]') ||
               row.querySelector('button span[aria-label="Expand row"]');
    });

    headerRows.forEach(function(headerRow) {
        var dataRows = [];
        var currentRow = headerRow.nextElementSibling;

        while (currentRow) {
            if (currentRow.querySelector('button span[aria-label="Collapse row"]') ||
                currentRow.querySelector('button span[aria-label="Expand row"]')) break;

            if (currentRow.cells.length > colIndex) dataRows.push(currentRow);
            currentRow = currentRow.nextElementSibling;
        }

        if (dataRows.length === 0) return;

        var kpiName = getFullHierarchy(headerRow);

        // 使用完整路径来检测，而不只是当前行
        var kpiTextForDetection = kpiName.toLowerCase();

        // 高=差的 KPI：DPMO, Miss, Defect, Error, Late, Fail, bps
        var isHighBad = (kpiTextForDetection.includes('miss') ||
                        kpiTextForDetection.includes('dpmo') ||
                        kpiTextForDetection.includes('defect') ||
                        kpiTextForDetection.includes('error') ||
                        kpiTextForDetection.includes('late') ||
                        kpiTextForDetection.includes('fail') ||
                        kpiTextForDetection.includes('bps'));

        logSystem('KPI: ' + kpiName + ' | isHighBad: ' + isHighBad);

        var prevColIndex = colIndex + 1;
        var hasPrevData = headerRow.cells.length > prevColIndex;

        var rowObjects = dataRows.map(function(r) {
            var name = r.cells[0].innerText.trim();
            var currVal = parseValue(r.cells[colIndex].innerText);
            var prevVal = -999999;
            if (hasPrevData) prevVal = parseValue(r.cells[prevColIndex].innerText);
            return { name: name, rawVal: r.cells[colIndex].innerText.trim(), numVal: currVal, prevVal: prevVal };
        });

        // 排序：isHighBad=true 时高的排前面（高=差），否则低的排前面（低=差）
        rowObjects.sort(function(a, b) {
            return isHighBad ? (b.numVal - a.numVal) : (a.numVal - b.numVal);
        });

        results.push({ kpiName: kpiName, isHighBad: isHighBad, allRows: rowObjects });
    });

    logSystem('Total KPIs extracted: ' + results.length);
    return results;
}

    // --- CSV & MODAL ---
    function downloadSummaryCSV(data) {
        let csvContent = "Hierarchy,Sort Logic,Rank,Entity Name,Current Value,Previous Value,WoW %\n";
        data.forEach(function(item) {
            const sortLogic = item.isHighBad ? "High=Bad" : "Low=Bad";
            item.allRows.forEach(function(row, index) {
                const safeKPI = '"' + item.kpiName.replace(/"/g, '""') + '"';
                const safeName = '"' + row.name.replace(/"/g, '""') + '"';
                const wow = calculateWoW(row.numVal, row.prevVal);
                csvContent += safeKPI + ',' + sortLogic + ',' + (index + 1) + ',' + safeName + ',"' + row.rawVal + '","' + (row.prevVal === -999999 ? 'N/A' : row.prevVal) + '",' + wow.text + '\n';
            });
        });
        triggerDownload(csvContent, 'Analysis_Hierarchy_Report.csv');
    }

    function downloadTableCSV(table, filename) {
        const rows = Array.from(table.rows).filter(function(r) { return r.style.display !== 'none'; });
        const csvContent = rows.map(function(row) {
            return Array.from(row.cells).map(function(cell) {
                let text = cell.innerText.trim();
                if (text.includes('"') || text.includes(',') || text.includes('\n')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                return text;
            }).join(',');
        }).join('\n');
        triggerDownload(csvContent, filename);
    }

    function triggerDownload(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // --- SECTION SELECTOR MODAL ---
    function createSectionSelectorModal(table, onComplete) {
        const existing = document.getElementById('pm-section-modal');
        if (existing) existing.remove();

        const sections = discoverSections(table);

        if (sections.length === 0) {
            alert('No expandable sections found in this table.');
            logSystem('No expandable sections found');
            return;
        }

        logSystem('Found ' + sections.length + ' expandable/collapsible sections');

        const styleId = 'pm-section-modal-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = '.pm-section-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; } .pm-section-modal { background: white; width: 90%; max-width: 600px; max-height: 80vh; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden; } .pm-section-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; } .pm-section-header h2 { margin: 0; font-size: 18px; font-weight: 600; } .pm-section-body { flex: 1; overflow-y: auto; padding: 0; } .pm-section-controls { padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; } .pm-section-list { padding: 10px 0; } .pm-section-item { display: flex; align-items: flex-start; padding: 12px 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s; } .pm-section-item:hover { background: #f8fafc; } .pm-section-item input[type="checkbox"] { width: 18px; height: 18px; margin-right: 12px; margin-top: 2px; cursor: pointer; accent-color: #667eea; } .pm-section-item-content { flex: 1; } .pm-section-item-name { font-weight: 500; color: #1e293b; font-size: 14px; } .pm-section-item-path { font-size: 11px; color: #94a3b8; margin-top: 2px; } .pm-section-item-status { font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-left: 10px; } .pm-section-item-status.expanded { background: #dcfce7; color: #166534; } .pm-section-item-status.collapsed { background: #fef3c7; color: #92400e; } .pm-section-footer { padding: 16px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; } .pm-section-count { font-size: 13px; color: #64748b; } .pm-section-actions { display: flex; gap: 10px; } .pm-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; border: none; } .pm-btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; } .pm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); } .pm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; } .pm-btn-secondary { background: white; color: #64748b; border: 1px solid #e2e8f0; } .pm-btn-secondary:hover { background: #f8fafc; } .pm-btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 6px; } .pm-btn-expand { background: linear-gradient(135deg, #10b981 0%, #059669 100%); } .pm-btn-collapse { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); } .pm-progress-bar { width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-top: 10px; } .pm-progress-fill { height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); transition: width 0.3s ease; width: 0%; } .pm-search-box { flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; } .pm-search-box:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }';
            document.head.appendChild(style);
        }

        const expandedCount = sections.filter(function(s) { return s.isExpanded; }).length;
        const collapsedCount = sections.filter(function(s) { return !s.isExpanded; }).length;

        const overlay = document.createElement('div');
        overlay.id = 'pm-section-modal';
        overlay.className = 'pm-section-overlay';

        overlay.innerHTML = '<div class="pm-section-modal"><div class="pm-section-header"><h2>📂 Expand / Collapse Sections</h2><button id="pm-section-close" style="background:none; border:none; color:white; font-size:24px; cursor:pointer; padding:0; line-height:1;">×</button></div><div class="pm-section-controls"><input type="text" class="pm-search-box" id="pm-section-search" placeholder="🔍 Search sections..."><button class="pm-btn pm-btn-secondary pm-btn-sm" id="pm-select-all">Select All</button><button class="pm-btn pm-btn-secondary pm-btn-sm" id="pm-deselect-all">Deselect All</button><button class="pm-btn pm-btn-secondary pm-btn-sm" id="pm-select-collapsed" title="Select all collapsed sections">Collapsed (' + collapsedCount + ')</button><button class="pm-btn pm-btn-secondary pm-btn-sm" id="pm-select-expanded" title="Select all expanded sections">Expanded (' + expandedCount + ')</button></div><div class="pm-section-body"><div class="pm-section-list" id="pm-section-list"></div></div><div class="pm-section-footer"><div class="pm-section-count"><span id="pm-selected-count">0</span> of ' + sections.length + ' selected<div class="pm-progress-bar" id="pm-progress-bar" style="display:none;"><div class="pm-progress-fill" id="pm-progress-fill"></div></div><div id="pm-progress-text" style="font-size:11px; margin-top:5px; color:#667eea;"></div></div><div class="pm-section-actions"><button class="pm-btn pm-btn-secondary" id="pm-section-cancel">Cancel</button><button class="pm-btn pm-btn-primary pm-btn-expand" id="pm-section-expand">▼ Expand</button><button class="pm-btn pm-btn-primary pm-btn-collapse" id="pm-section-collapse">▲ Collapse</button></div></div></div>';

        document.body.appendChild(overlay);

        const listContainer = document.getElementById('pm-section-list');

        sections.forEach(function(section, index) {
            const item = document.createElement('div');
            item.className = 'pm-section-item';
            item.setAttribute('data-index', index);
            item.setAttribute('data-expanded', section.isExpanded ? 'true' : 'false');

            const pathParts = section.hierarchy.split(' > ');
            const mainName = pathParts.pop();
            const breadcrumb = pathParts.join(' > ');

            let itemHTML = '<input type="checkbox" id="pm-section-cb-' + index + '">';
            itemHTML += '<div class="pm-section-item-content">';
            itemHTML += '<div class="pm-section-item-name">' + mainName + '</div>';
            if (breadcrumb) {
                itemHTML += '<div class="pm-section-item-path">' + breadcrumb + '</div>';
            }
            itemHTML += '</div>';
            itemHTML += '<span class="pm-section-item-status ' + (section.isExpanded ? 'expanded' : 'collapsed') + '">';
            itemHTML += section.isExpanded ? '✓ Expanded' : 'Collapsed';
            itemHTML += '</span>';

            item.innerHTML = itemHTML;

            item.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    const cb = item.querySelector('input[type="checkbox"]');
                    cb.checked = !cb.checked;
                    updateSelectedCount();
                }
            });

            item.querySelector('input[type="checkbox"]').addEventListener('change', updateSelectedCount);

            listContainer.appendChild(item);
        });

        function updateSelectedCount() {
            const checkboxes = listContainer.querySelectorAll('input[type="checkbox"]:checked');
            document.getElementById('pm-selected-count').textContent = checkboxes.length;

            const expandBtn = document.getElementById('pm-section-expand');
            const collapseBtn = document.getElementById('pm-section-collapse');

            expandBtn.disabled = checkboxes.length === 0;
            collapseBtn.disabled = checkboxes.length === 0;
        }

        // Search
        document.getElementById('pm-section-search').addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const items = listContainer.querySelectorAll('.pm-section-item');
            items.forEach(function(item) {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? '' : 'none';
            });
        });

        // Select All
        document.getElementById('pm-select-all').addEventListener('click', function() {
            listContainer.querySelectorAll('.pm-section-item').forEach(function(item) {
                if (item.style.display !== 'none') {
                    item.querySelector('input[type="checkbox"]').checked = true;
                }
            });
            updateSelectedCount();
        });

        // Deselect All
        document.getElementById('pm-deselect-all').addEventListener('click', function() {
            listContainer.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
                cb.checked = false;
            });
            updateSelectedCount();
        });

        // Select Collapsed
        document.getElementById('pm-select-collapsed').addEventListener('click', function() {
            listContainer.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
                cb.checked = false;
            });
            sections.forEach(function(section, index) {
                if (!section.isExpanded) {
                    const item = listContainer.querySelector('[data-index="' + index + '"]');
                    if (item && item.style.display !== 'none') {
                        const cb = document.getElementById('pm-section-cb-' + index);
                        if (cb) cb.checked = true;
                    }
                }
            });
            updateSelectedCount();
        });

        // Select Expanded
        document.getElementById('pm-select-expanded').addEventListener('click', function() {
            listContainer.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
                cb.checked = false;
            });
            sections.forEach(function(section, index) {
                if (section.isExpanded) {
                    const item = listContainer.querySelector('[data-index="' + index + '"]');
                    if (item && item.style.display !== 'none') {
                        const cb = document.getElementById('pm-section-cb-' + index);
                        if (cb) cb.checked = true;
                    }
                }
            });
            updateSelectedCount();
        });

        // Close handlers
        document.getElementById('pm-section-close').addEventListener('click', function() {
            overlay.remove();
        });

        document.getElementById('pm-section-cancel').addEventListener('click', function() {
            overlay.remove();
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        // EXPAND button
        document.getElementById('pm-section-expand').addEventListener('click', async function() {
            const selectedIndices = [];
            listContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(function(cb) {
                const item = cb.closest('.pm-section-item');
                selectedIndices.push(parseInt(item.getAttribute('data-index')));
            });

            if (selectedIndices.length === 0) return;

            const sectionsToExpand = selectedIndices.map(function(i) {
                return sections[i];
            }).filter(function(s) {
                return !s.isExpanded;
            });

            if (sectionsToExpand.length === 0) {
                showToast('All selected sections are already expanded');
                return;
            }

            const expandBtn = document.getElementById('pm-section-expand');
            const collapseBtn = document.getElementById('pm-section-collapse');
            const cancelBtn = document.getElementById('pm-section-cancel');
            const progressBar = document.getElementById('pm-progress-bar');
            const progressFill = document.getElementById('pm-progress-fill');
            const progressText = document.getElementById('pm-progress-text');

            expandBtn.disabled = true;
            collapseBtn.disabled = true;
            expandBtn.textContent = 'Expanding...';
            cancelBtn.disabled = true;
            progressBar.style.display = 'block';

            logSystem('Starting DEEP expansion of ' + sectionsToExpand.length + ' sections...');

            await expandSelectedSections(
                table,
                sectionsToExpand,
                function(current, total, name, status) {
                    const percent = (current / total) * 100;
                    progressFill.style.width = percent + '%';
                    progressText.innerHTML = '<strong>' + current + '/' + total + '</strong> - ' + name + '<span style="color:#a5b4fc; margin-left:8px;">' + (status || '') + '</span>';
                },
                function(totalExpanded) {
                    logSystem('Deep expansion complete! Expanded ' + totalExpanded + ' total nodes.');
                    progressFill.style.width = '100%';
                    progressText.innerHTML = '<span style="color:#4ade80;">✓ Done!</span> Expanded ' + totalExpanded + ' total nodes across ' + sectionsToExpand.length + ' sections.';

                    showToast('Expanded ' + totalExpanded + ' sections successfully!');

                    setTimeout(function() {
                        overlay.remove();
                        if (onComplete) onComplete(totalExpanded);
                    }, 1000);
                }
            );
        });

        // COLLAPSE button
        document.getElementById('pm-section-collapse').addEventListener('click', async function() {
            const selectedIndices = [];
            listContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(function(cb) {
                const item = cb.closest('.pm-section-item');
                selectedIndices.push(parseInt(item.getAttribute('data-index')));
            });

            if (selectedIndices.length === 0) return;

            const sectionsToCollapse = selectedIndices.map(function(i) {
                return sections[i];
            }).filter(function(s) {
                return s.isExpanded;
            });

            if (sectionsToCollapse.length === 0) {
                showToast('All selected sections are already collapsed');
                return;
            }

            const expandBtn = document.getElementById('pm-section-expand');
            const collapseBtn = document.getElementById('pm-section-collapse');
            const cancelBtn = document.getElementById('pm-section-cancel');
            const progressBar = document.getElementById('pm-progress-bar');
            const progressFill = document.getElementById('pm-progress-fill');
            const progressText = document.getElementById('pm-progress-text');

            expandBtn.disabled = true;
            collapseBtn.disabled = true;
            collapseBtn.textContent = 'Collapsing...';
            cancelBtn.disabled = true;
            progressBar.style.display = 'block';

            logSystem('Starting collapse of ' + sectionsToCollapse.length + ' sections...');

            await collapseSelectedSections(
                table,
                sectionsToCollapse,
                function(current, total, name, status) {
                    const percent = (current / total) * 100;
                    progressFill.style.width = percent + '%';
                    progressText.innerHTML = '<strong>' + current + '/' + total + '</strong> - ' + name + '<span style="color:#fdba74; margin-left:8px;">' + (status || '') + '</span>';
                },
                function(totalCollapsed) {
                    logSystem('Collapse complete! Collapsed ' + totalCollapsed + ' sections.');
                    progressFill.style.width = '100%';
                    progressFill.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                    progressText.innerHTML = '<span style="color:#fb923c;">✓ Done!</span> Collapsed ' + totalCollapsed + ' sections.';

                    showToast('Collapsed ' + totalCollapsed + ' sections successfully!');

                    setTimeout(function() {
                        overlay.remove();
                        if (onComplete) onComplete(totalCollapsed);
                    }, 1000);
                }
            );
        });

        updateSelectedCount();
    }

    // --- ANALYSIS MODAL ---
    function processHierarchyData(data) {
        const kpiMap = new Map();

        data.forEach(function(item) {
            const pathParts = item.kpiName.split(' > ');
            const kpiName = pathParts[0];

            if (!kpiMap.has(kpiName)) {
                kpiMap.set(kpiName, {
                    kpiName: kpiName,
                    isHighBad: item.isHighBad,
                    stations: []
                });
            }

            const kpiEntry = kpiMap.get(kpiName);

            item.allRows.forEach(function(row) {
                if (row.numVal === -999999) return;

                const rowName = row.name;
                const isStation = /^[A-Z]{2,4}\d+$/.test(rowName);

                if (isStation) {
                    const existing = kpiEntry.stations.find(function(s) {
                        return s.name === rowName;
                    });
                    if (!existing) {
                        kpiEntry.stations.push({
                            name: rowName,
                            value: row.rawVal,
                            numVal: row.numVal
                        });
                    }
                }
            });
        });

        const result = Array.from(kpiMap.values());

        result.forEach(function(kpi) {
            if (kpi.isHighBad) {
                kpi.stations.sort(function(a, b) { return b.numVal - a.numVal; });
            } else {
                kpi.stations.sort(function(a, b) { return a.numVal - b.numVal; });
            }
        });

        return result;
    }

    function getCurrentWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 604800000;
        return Math.ceil((diff / oneWeek) + 1);
    }

    function showBottom3SummaryModal(data) {
        const existing = document.getElementById('pm-bottom3-modal');
        if (existing) existing.remove();

        const currentWeek = getCurrentWeekNumber();
        const reviewWeek = currentWeek - 1;

        const processedData = processHierarchyData(data);

        const overlay = document.createElement('div');
        overlay.id = 'pm-bottom3-modal';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0,0,0,0.7)';
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.zIndex = '10001';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        function getGradientColor(rank, total) {
            if (total <= 1) return { bg: '#f5f5f5', text: '#525252' };

            const ratio = (rank - 1) / (total - 1);

            var r, g, b;
            if (ratio < 0.5) {
                var t = ratio * 2;
                r = 180 - (t * 30);
                g = 80 + (t * 100);
                b = 80;
            } else {
                var t = (ratio - 0.5) * 2;
                r = 150 - (t * 80);
                g = 180 - (t * 30);
                b = 80 + (t * 40);
            }

            var bgR = Math.round(255 - (255 - r) * 0.15);
            var bgG = Math.round(255 - (255 - g) * 0.15);
            var bgB = Math.round(255 - (255 - b) * 0.15);

            return {
                bg: 'rgb(' + bgR + ', ' + bgG + ', ' + bgB + ')',
                text: 'rgb(' + Math.round(r * 0.7) + ', ' + Math.round(g * 0.7) + ', ' + Math.round(b * 0.7) + ')'
            };
        }

        var bottom3Rows = '';
        processedData.forEach(function(item) {
            if (item.stations.length === 0) return;
            var total = item.stations.length;

            var bottom3 = item.stations.slice(0, 3).map(function(s, i) {
                var colors = getGradientColor(i + 1, total);
                return '<span style="display:inline-block; padding:4px 10px; margin:2px 4px; border-radius:6px; background:' + colors.bg + '; color:' + colors.text + '; font-weight:500;">' + s.name + ' (' + s.value + ')</span>';
            }).join('');

            bottom3Rows += '<tr><td style="padding:14px 18px; border-bottom:1px solid #e5e7eb; font-weight:600; color:#374151; font-size:14px;">' + item.kpiName + '</td><td style="padding:14px 18px; border-bottom:1px solid #e5e7eb; font-family:monospace; font-size:13px;">' + bottom3 + '</td></tr>';
        });

        var fullRankingRows = '';
        processedData.forEach(function(item) {
            if (item.stations.length === 0) return;

            var total = item.stations.length;
            var allStations = item.stations.map(function(s, i) {
                var rank = i + 1;
                var colors = getGradientColor(rank, total);

                return '<span style="display:inline-block; padding:5px 12px; margin:3px; border-radius:6px; background:' + colors.bg + '; color:' + colors.text + '; font-size:13px; font-weight:500;">#' + rank + ' ' + s.name + ' (' + s.value + ')</span>';
            }).join('');

            fullRankingRows += '<tr><td style="padding:16px 18px; border-bottom:1px solid #e5e7eb; font-weight:600; color:#374151; vertical-align:top; white-space:nowrap; font-size:14px;">' + item.kpiName + '</td><td style="padding:16px 18px; border-bottom:1px solid #e5e7eb; font-family:monospace; line-height:2.2;">' + allStations + '</td></tr>';
        });

        var totalStations = processedData.reduce(function(sum, d) { return sum + d.stations.length; }, 0);

        var modalHTML = '<div style="background:white; width:95%; max-width:1200px; max-height:90vh; border-radius:12px; box-shadow:0 20px 50px rgba(0,0,0,0.3); display:flex; flex-direction:column; overflow:hidden;">';
        modalHTML += '<div style="background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:white; padding:20px 24px; display:flex; justify-content:space-between; align-items:center;">';
        modalHTML += '<div><h2 style="margin:0; font-size:20px; font-weight:600;">PRX WBR Wk' + currentWeek + ' (Review for Wk' + reviewWeek + ')</h2>';
        modalHTML += '<p style="margin:6px 0 0 0; font-size:13px; opacity:0.9;">Station Ranking - All Regions Combined</p></div>';
        modalHTML += '<div style="display:flex; gap:10px;">';
        modalHTML += '<button id="pm-copy-bottom3" style="background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); color:white; padding:10px 18px; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">📋 Copy</button>';
        modalHTML += '<button id="pm-download-bottom3" style="background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); color:white; padding:10px 18px; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">⬇ CSV</button>';
        modalHTML += '<button id="pm-close-bottom3" style="background:none; border:none; color:white; font-size:28px; cursor:pointer; padding:0 8px; opacity:0.8;">×</button>';
        modalHTML += '</div></div>';

        modalHTML += '<div style="flex:1; overflow-y:auto; padding:0;">';
        modalHTML += '<div style="display:flex; border-bottom:2px solid #e5e7eb; background:#f8fafc; position:sticky; top:0; z-index:10;">';
        modalHTML += '<button id="pm-tab-bottom3" style="flex:1; padding:16px; border:none; background:#6366f1; color:white; font-weight:600; font-size:14px; cursor:pointer;">🏆 Bottom 3 Summary</button>';
        modalHTML += '<button id="pm-tab-full" style="flex:1; padding:16px; border:none; background:white; color:#64748b; font-weight:600; font-size:14px; cursor:pointer;">📊 Full Ranking</button>';
        modalHTML += '</div>';

        modalHTML += '<div id="pm-panel-bottom3">';
        modalHTML += '<div style="padding:18px 24px; background:#fafafa; border-bottom:1px solid #e5e7eb;">';
        modalHTML += '<div style="font-size:14px; color:#525252; font-weight:600;">🚨 Bottom 3 Stations by KPI</div>';
        modalHTML += '<div style="font-size:12px; color:#737373; margin-top:5px;">Worst performing stations across all regions</div></div>';
        modalHTML += '<table style="width:100%; border-collapse:collapse;"><thead><tr style="background:#fafafa;">';
        modalHTML += '<th style="padding:16px 18px; text-align:left; border-bottom:2px solid #e5e7eb; color:#525252; font-weight:600; font-size:14px; width:30%;">KPI</th>';
        modalHTML += '<th style="padding:16px 18px; text-align:left; border-bottom:2px solid #e5e7eb; color:#525252; font-weight:600; font-size:14px;">Bottom 3 Stations</th>';
        modalHTML += '</tr></thead><tbody>';
        modalHTML += bottom3Rows || '<tr><td colspan="2" style="padding:50px; text-align:center; color:#9ca3af; font-size:14px;">No station data found</td></tr>';
        modalHTML += '</tbody></table></div>';

        modalHTML += '<div id="pm-panel-full" style="display:none;">';
        modalHTML += '<div style="padding:18px 24px; background:#fafafa; border-bottom:1px solid #e5e7eb;">';
        modalHTML += '<div style="font-size:14px; color:#525252; font-weight:600;">📊 Complete Station Ranking by KPI</div>';
        modalHTML += '<div style="font-size:12px; color:#737373; margin-top:5px;">All stations ranked</div></div>';
        modalHTML += '<table style="width:100%; border-collapse:collapse;"><thead><tr style="background:#fafafa;">';
        modalHTML += '<th style="padding:16px 18px; text-align:left; border-bottom:2px solid #e5e7eb; color:#525252; font-weight:600; font-size:14px; width:20%;">KPI</th>';
        modalHTML += '<th style="padding:16px 18px; text-align:left; border-bottom:2px solid #e5e7eb; color:#525252; font-weight:600; font-size:14px;">All Stations (Ranked)</th>';
        modalHTML += '</tr></thead><tbody>';
        modalHTML += fullRankingRows || '<tr><td colspan="2" style="padding:50px; text-align:center; color:#9ca3af; font-size:14px;">No station data found</td></tr>';
        modalHTML += '</tbody></table></div>';
        modalHTML += '</div>';

        modalHTML += '<div style="padding:14px 24px; background:#fafafa; border-top:1px solid #e5e7eb; font-size:12px; color:#737373; display:flex; justify-content:space-between;">';
        modalHTML += '<span>KPIs: ' + processedData.length + ' | Total Stations: ' + totalStations + '</span>';
        modalHTML += '<span>' + new Date().toLocaleString() + '</span></div></div>';

        overlay.innerHTML = modalHTML;
        document.body.appendChild(overlay);

        // Tab switching
        var tabBottom3 = document.getElementById('pm-tab-bottom3');
        var tabFull = document.getElementById('pm-tab-full');
        var panelBottom3 = document.getElementById('pm-panel-bottom3');
        var panelFull = document.getElementById('pm-panel-full');

        tabBottom3.onclick = function() {
            tabBottom3.style.background = '#6366f1';
            tabBottom3.style.color = 'white';
            tabFull.style.background = 'white';
            tabFull.style.color = '#64748b';
            panelBottom3.style.display = 'block';
            panelFull.style.display = 'none';
        };

        tabFull.onclick = function() {
            tabFull.style.background = '#6366f1';
            tabFull.style.color = 'white';
            tabBottom3.style.background = 'white';
            tabBottom3.style.color = '#64748b';
            panelFull.style.display = 'block';
            panelBottom3.style.display = 'none';
        };

        // Close
        document.getElementById('pm-close-bottom3').onclick = function() { overlay.remove(); };
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

        // Copy
        document.getElementById('pm-copy-bottom3').onclick = function() {
            var text = 'PRX WBR Wk' + currentWeek + ' (Review for Wk' + reviewWeek + ')\n';
            text += '======================================================================\n\n';
            text += 'BOTTOM 3 STATIONS BY KPI\n';
            text += '----------------------------------------------------------------------\n';
            processedData.forEach(function(item) {
                var bottom3 = item.stations.slice(0, 3).map(function(s, i) {
                    return '#' + (i + 1) + ' ' + s.name + '(' + s.value + ')';
                }).join(', ');
                text += item.kpiName + ': ' + (bottom3 || 'N/A') + '\n';
            });

            text += '\nFULL RANKING\n';
            text += '----------------------------------------------------------------------\n';
            processedData.forEach(function(item) {
                text += '\n' + item.kpiName + ':\n';
                item.stations.forEach(function(s, i) {
                    text += '  #' + (i + 1) + ' ' + s.name + ' (' + s.value + ')\n';
                });
            });

            navigator.clipboard.writeText(text).then(function() {
                showToast('Copied to clipboard!');
            }).catch(function() {
                showToast('Failed to copy');
            });
        };

        // Download CSV
        document.getElementById('pm-download-bottom3').onclick = function() {
            var csv = '"PRX WBR Wk' + currentWeek + ' (Review for Wk' + reviewWeek + ')"\n\n';
            csv += '"BOTTOM 3 SUMMARY"\n';
            csv += '"KPI","#1","#2","#3"\n';
            processedData.forEach(function(item) {
                var kpi = item.kpiName.replace(/"/g, '""');
                var s1 = item.stations[0] ? item.stations[0].name + ' (' + item.stations[0].value + ')' : '';
                var s2 = item.stations[1] ? item.stations[1].name + ' (' + item.stations[1].value + ')' : '';
                var s3 = item.stations[2] ? item.stations[2].name + ' (' + item.stations[2].value + ')' : '';
                csv += '"' + kpi + '","' + s1 + '","' + s2 + '","' + s3 + '"\n';
            });

            csv += '\n"FULL RANKING"\n';
            csv += '"KPI","Rank","Station","Value"\n';
            processedData.forEach(function(item) {
                var kpi = item.kpiName.replace(/"/g, '""');
                item.stations.forEach(function(s, i) {
                    csv += '"' + kpi + '","' + (i + 1) + '","' + s.name + '","' + s.value + '"\n';
                });
            });

            triggerDownload(csv, 'PRX_WBR_Wk' + currentWeek + '_Station_Ranking.csv');
            showToast('CSV downloaded!');
        };
    }

    function createAndShowModal(data) {
        var existing = document.getElementById('pm-analysis-modal');
        if (existing) existing.remove();

        var styleEl = document.createElement('style');
        styleEl.textContent = '.pm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; font-family: sans-serif; } .pm-modal { background: white; width: 95%; max-width: 1200px; height: 90vh; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden; } .pm-header { background: #1f2937; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; } .pm-body { display: flex; flex: 1; overflow: hidden; } .pm-sidebar { width: 30%; background: #f3f4f6; border-right: 1px solid #e5e7eb; overflow-y: auto; padding: 10px; } .pm-content { width: 70%; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; } .pm-log-panel { height: 80px; background: #111827; color: #9ca3af; font-family: monospace; font-size: 11px; padding: 10px; overflow-y: auto; border-top: 1px solid #374151; flex-shrink: 0; } .pm-kpi-btn { display: block; width: 100%; text-align: left; padding: 12px; margin-bottom: 5px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; font-size: 12px; color: #374151; background: white; line-height: 1.4; } .pm-kpi-btn:hover { background: #e5e7eb; } .pm-kpi-btn.active { background: #eff6ff; color: #1e40af; border-left: 4px solid #3b82f6; font-weight: 600; } .pm-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; } .pm-table th { text-align: left; border-bottom: 2px solid #e5e7eb; padding: 8px; color: #6b7280; position: sticky; top: 0; background: white; z-index: 1; } .pm-table td { border-bottom: 1px solid #f3f4f6; padding: 8px; color: #1f2937; } .pm-row-red { background-color: #fef2f2; border-left: 3px solid #ef4444; } .pm-row-yellow { background-color: #fefce8; border-left: 3px solid #eab308; } .pm-btn-green { background: #16a34a; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; } .pm-crumb { color: #9ca3af; font-size: 10px; display: block; margin-bottom: 2px; }';
        document.head.appendChild(styleEl);

        var overlay = document.createElement('div');
        overlay.id = 'pm-analysis-modal';
        overlay.className = 'pm-modal-overlay';

        var modalHTML = '<div class="pm-modal">';
        modalHTML += '<div class="pm-header">';
        modalHTML += '<h2 style="margin:0; font-size:18px;">📊 Hierarchy Analysis (v1.4)</h2>';
        modalHTML += '<div style="display:flex; gap:10px;">';
        modalHTML += '<button class="pm-btn-green" id="pm-bottom3-summary" style="background:#8b5cf6;">📋 Bottom 3 Summary</button>';
        modalHTML += '<button class="pm-btn-green" id="pm-download-summary">⬇ Download Report</button>';
        modalHTML += '<button id="pm-close" style="background:none; border:none; color:white; font-size:20px; cursor:pointer;">✕</button>';
        modalHTML += '</div></div>';
        modalHTML += '<div class="pm-body">';
        modalHTML += '<div class="pm-sidebar" id="pm-kpi-list"></div>';
        modalHTML += '<div class="pm-content" id="pm-kpi-detail"><div style="text-align:center; color:#9ca3af; margin-top:50px;">Select a Section</div></div>';
        modalHTML += '</div>';
        modalHTML += '<div class="pm-log-panel" id="pm-log-container"><div style="color:#6b7280; font-weight:bold; margin-bottom:5px;">SYSTEM LOGS:</div></div>';
        modalHTML += '</div>';

        overlay.innerHTML = modalHTML;
        document.body.appendChild(overlay);

        var logContainer = document.getElementById('pm-log-container');
        logHistory.forEach(function(msg) {
            var d = document.createElement('div');
            d.style.marginBottom = '2px';
            d.innerText = msg;
            logContainer.appendChild(d);
        });
        logContainer.scrollTop = logContainer.scrollHeight;

        document.getElementById('pm-close').onclick = function() { overlay.remove(); };
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
        document.getElementById('pm-download-summary').onclick = function() { downloadSummaryCSV(data); };
        document.getElementById('pm-bottom3-summary').onclick = function() { showBottom3SummaryModal(data); };

        var sidebar = document.getElementById('pm-kpi-list');
        var content = document.getElementById('pm-kpi-detail');

        if (data.length === 0) {
            sidebar.innerHTML = '<div style="padding:20px; color:#9ca3af; text-align:center;">No expanded sections found.<br><br>Please expand some sections first, then click Analyze.</div>';
            return;
        }

        data.forEach(function(item, index) {
            var btn = document.createElement('button');
            btn.className = 'pm-kpi-btn';
            var parts = item.kpiName.split(' > ');
            var mainName = parts.pop();
            var breadcrumb = parts.join(' > ');
            btn.innerHTML = (breadcrumb ? '<span class="pm-crumb">' + breadcrumb + '</span>' : '') + mainName + ' <span style="float:right; opacity:0.6; font-size:10px;">(' + item.allRows.length + ')</span>';

            btn.onclick = function() {
                document.querySelectorAll('.pm-kpi-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');

                var tableHTML = '<div style="margin-bottom:15px; border-bottom:1px solid #e5e7eb; padding-bottom:10px;">';
                tableHTML += '<h3 style="margin:0; color:#111827; font-size:16px;">' + mainName + '</h3>';
                tableHTML += '<div style="font-size:12px; color:#6b7280; margin-top:4px;">Path: <strong>' + (breadcrumb || 'Root') + '</strong></div>';
                tableHTML += '<div style="font-size:11px; color:#9ca3af; margin-top:4px;">Logic: ' + (item.isHighBad ? 'High=Bad' : 'Low=Bad') + '</div>';
                tableHTML += '</div>';
                tableHTML += '<div style="flex:1; overflow-y:auto;">';
                tableHTML += '<table class="pm-table"><thead><tr><th>Rank</th><th>Entity Name</th><th style="text-align:right">Current</th><th style="text-align:right">WoW %</th></tr></thead><tbody>';

                item.allRows.forEach(function(row, i) {
                    var rowClass = '';
                    if (i < 5) rowClass = 'pm-row-red';
                    else if (i < 10) rowClass = 'pm-row-yellow';
                    var wow = calculateWoW(row.numVal, row.prevVal);
                    tableHTML += '<tr class="' + rowClass + '"><td style="width:50px; font-weight:' + (i < 5 ? 'bold' : 'normal') + '">#' + (i + 1) + '</td><td>' + row.name + '</td><td style="text-align:right; font-family:monospace;">' + row.rawVal + '</td><td style="text-align:right; font-family:monospace; color:' + wow.color + '">' + wow.text + '</td></tr>';
                });

                tableHTML += '</tbody></table></div>';
                content.innerHTML = tableHTML;
            };

            sidebar.appendChild(btn);
            if (index === 0) btn.click();
        });
    }

    // --- BOTTOM 5 SORT LOGIC ---
function applyBottom5Sort(table, weekColIndex) {
    var expandedHeaderRows = Array.from(table.rows).filter(function(row) {
        return row.querySelector('button span[aria-label="Collapse row"]');
    });

    var sectionsProcessed = 0;

    expandedHeaderRows.forEach(function(headerRow) {
        var dataRows = [];
        var currentRow = headerRow.nextElementSibling;

        while (currentRow) {
            if (currentRow.querySelector('button span[aria-label="Collapse row"]') ||
                currentRow.querySelector('button span[aria-label="Expand row"]')) {
                break;
            }

            if (currentRow.cells.length > weekColIndex && currentRow.style.display !== 'none') {
                dataRows.push(currentRow);
            }
            currentRow = currentRow.nextElementSibling;
        }

        if (dataRows.length === 0) return;

        sectionsProcessed++;

        // 使用完整路径来检测
        var kpiName = getFullHierarchy(headerRow);
        var kpiTextForDetection = kpiName.toLowerCase();

        // 高=差的 KPI：DPMO, Miss, Defect, Error, Late, Fail, bps
        var isHighBad = (kpiTextForDetection.includes('miss') ||
                        kpiTextForDetection.includes('dpmo') ||
                        kpiTextForDetection.includes('defect') ||
                        kpiTextForDetection.includes('error') ||
                        kpiTextForDetection.includes('late') ||
                        kpiTextForDetection.includes('fail') ||
                        kpiTextForDetection.includes('bps'));

        logSystem('Bottom5 - KPI: ' + kpiName + ' | isHighBad: ' + isHighBad);

        // 排序：isHighBad=true 时高的排前面（高=差），否则低的排前面（低=差）
        dataRows.sort(function(a, b) {
            var vA = parseValue(a.cells[weekColIndex].innerText);
            var vB = parseValue(b.cells[weekColIndex].innerText);
            return isHighBad ? (vB - vA) : (vA - vB);
        });

        var insertionPoint = currentRow;
        var parent = headerRow.parentNode;

        dataRows.forEach(function(row, idx) {
            parent.insertBefore(row, insertionPoint);

            if (idx < 5) {
                row.style.display = '';
                row.style.backgroundColor = '#fff5f5';
                row.style.borderLeft = '3px solid #ef4444';
            } else {
                row.style.display = 'none';
                row.style.backgroundColor = '';
                row.style.borderLeft = '';
            }
        });
    });

    logSystem('Bottom 5: Processed ' + sectionsProcessed + ' expanded sections');

    if (sectionsProcessed > 0) {
        showToast('Showing Bottom 5 for ' + sectionsProcessed + ' expanded section' + (sectionsProcessed > 1 ? 's' : ''));
    }
}

    // --- BUTTON STYLING ---
    function styleCircularButton(btn, bgColor) {
        btn.style.display = 'inline-block';
        btn.style.marginRight = '8px';
        btn.style.padding = '8px 16px';
        btn.style.marginBottom = '4px';
        btn.style.background = bgColor;
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '50px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.fontSize = '12px';
        btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        btn.style.transition = 'all 0.2s ease';

        btn.onmouseover = function() {
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 3px 5px rgba(0,0,0,0.3)';
        };
        btn.onmouseout = function() {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        };
    }

    // --- MAIN INJECTION ---
function injectMainButtons() {
    var tables = document.querySelectorAll('table');
    tables.forEach(function(table, idx) {
        if (table.dataset.tmSuiteInjected === 'true') return;
        if (!table.parentNode) return;

        var hasExpanders = table.querySelector('span[aria-label="Expand row"]') !== null;
        var hasCollapsers = table.querySelector('span[aria-label="Collapse row"]') !== null;

        if (!hasExpanders && !hasCollapsers) return;

        var weekColIndex = getWeekColumnIndex(table);
        if (weekColIndex === -1) return;

        // Remove zombie containers
        var prev = table.previousElementSibling;
        while (prev && prev.classList.contains(CONTAINER_CLASS)) {
            prev.remove();
            prev = table.previousElementSibling;
        }

        table.dataset.tmSuiteInjected = 'true';
        logSystem('Injecting buttons for table ' + (idx + 1));

        var container = document.createElement('div');
        container.classList.add(CONTAINER_CLASS);
        container.style.textAlign = 'center';
        container.style.padding = '12px 0';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.gap = '4px';
        container.style.position = 'sticky';
        container.style.top = '0';
        container.style.zIndex = '10';
        container.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        container.style.borderBottom = '1px solid #ddd';
        container.style.marginBottom = '10px';

        // 1. Select & Expand/Collapse Button
        var btnSelectExpand = document.createElement('button');
        btnSelectExpand.innerHTML = '📂 Select & Expand/Collapse';
        styleCircularButton(btnSelectExpand, '#667eea');

        // 2. Collapse All Button
        var btnCollapseAll = document.createElement('button');
        btnCollapseAll.innerHTML = '⬆️ Collapse All';
        styleCircularButton(btnCollapseAll, '#f97316');

        // 3. Analyze Button
        var btnAnalyze = document.createElement('button');
        btnAnalyze.innerHTML = '📊 Analyze';
        styleCircularButton(btnAnalyze, '#0891b2');

        // 4. Bottom 5 Button
        var btnBottom5 = document.createElement('button');
        btnBottom5.textContent = 'Bottom 5';
        btnBottom5.dataset.active = 'false';
        styleCircularButton(btnBottom5, '#dc3545');

        // 5. Refresh Button
        var btnRefresh = document.createElement('button');
        btnRefresh.innerHTML = '↻ Refresh';
        styleCircularButton(btnRefresh, '#4b5563');
        btnRefresh.title = 'Reload page to clear all duplicates and state';

        // 6. Hide Toolbar Button
        var btnHide = document.createElement('button');
        btnHide.innerHTML = '👁️ Hide';
        styleCircularButton(btnHide, '#6b7280');
        btnHide.title = 'Hide toolbar (click 📊 in corner to show)';

        // EVENT LISTENERS

        // Select & Expand/Collapse
        btnSelectExpand.addEventListener('click', function() {
            logSystem('Opening section selector modal...');
            createSectionSelectorModal(table, function(count) {
                logSystem('Operation complete: ' + count + ' sections processed');
            });
        });

        // Collapse All
        btnCollapseAll.addEventListener('click', async function() {
            logSystem('Collapse All button clicked');

            var collapseButtons = table.querySelectorAll('span[aria-label="Collapse row"]');

            if (collapseButtons.length === 0) {
                showToast('Nothing to collapse - all sections are already collapsed');
                return;
            }

            btnCollapseAll.innerHTML = '⏳ Collapsing...';
            btnCollapseAll.disabled = true;
            btnCollapseAll.style.opacity = '0.7';

            resetTableRows(table);

            try {
                var totalCollapsed = await collapseAllSections(table);
                showToast('Collapsed ' + totalCollapsed + ' sections');
            } catch (error) {
                logSystem('Error: ' + error.message);
            } finally {
                btnCollapseAll.innerHTML = '⬆️ Collapse All';
                btnCollapseAll.disabled = false;
                btnCollapseAll.style.opacity = '1';
            }
        });

        // Analyze
        btnAnalyze.addEventListener('click', function() {
            logSystem('Analyze button clicked');
            var data = extractAllSortedData(table, weekColIndex);
            if (data.length === 0) {
                showToast('No expanded sections found. Please expand sections first.');
            }
            createAndShowModal(data);
        });

        // Bottom 5
        btnBottom5.addEventListener('click', function() {
            logSystem('Bottom 5 button clicked');
            var isActive = btnBottom5.dataset.active === 'true';

            if (isActive) {
                resetTableRows(table);
                btnBottom5.textContent = 'Bottom 5';
                btnBottom5.style.background = '#dc3545';
                btnBottom5.dataset.active = 'false';
                showToast('Showing all rows');
            } else {
                var hasExpandedSections = table.querySelector('span[aria-label="Collapse row"]') !== null;

                if (!hasExpandedSections) {
                    showToast('No expanded sections. Please expand some sections first.');
                    return;
                }

                applyBottom5Sort(table, weekColIndex);
                btnBottom5.textContent = 'Show All';
                btnBottom5.style.background = '#6c757d';
                btnBottom5.dataset.active = 'true';
            }
        });

        // Refresh
        btnRefresh.addEventListener('click', function() {
            window.location.reload();
        });

        // Hide Toolbar
        btnHide.addEventListener('click', function() {
            hideAllToolbars();
            var toggleBtn = document.getElementById('pm-toggle-toolbar-btn');
            if (toggleBtn) {
                toggleBtn.innerHTML = '👁️';
                toggleBtn.title = 'Show Toolbar';
            }
            showToast('Toolbar hidden - click 📊 in bottom right to show');
        });

        // Append all buttons to container
        container.appendChild(btnSelectExpand);
        container.appendChild(btnCollapseAll);
        container.appendChild(btnAnalyze);
        container.appendChild(btnBottom5);
        container.appendChild(btnRefresh);
        container.appendChild(btnHide);

        // Check if toolbar should be hidden from previous session
        if (isToolbarHidden()) {
            container.style.display = 'none';
        }

        table.parentNode.insertBefore(container, table);
        logSystem('Buttons injected for table ' + (idx + 1));
    });
}


    // --- MAIN EXECUTION ---
    function run() {
        injectMainButtons();
        injectAttribution();
    }

    // Initial run
    logSystem('PerfectMile Caravan Analyzer Suite v1.4 initialized');
    run();

    // Periodic check for new tables
    setInterval(run, CHECK_INTERVAL_MS);

})();