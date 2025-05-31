import { dataManager } from './dataManager.js';
import { getObjectColor, getObjectName, generateObjectId } from './config.js';

class UIPanel {
    constructor(panelElement) {
        this.panel = panelElement;
    }

    // 格式化坐标显示
    formatCoordinate(value) {
        return value.toFixed(6).padStart(10, '0');
    }

    // 格式化置信度显示
    formatConfidence(value) {
        const percentage = (value * 100).toFixed(1);
        return `${percentage}%`.padStart(6, ' ');
    }

    // 获取目标状态描述
    getTargetStatus(confidence) {
        if (confidence > 0.8) return "LOCKED";
        if (confidence > 0.5) return "TRACK";
        return "DETECT";
    }

    // 更新数据面板
    update() {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        
        let html = `
            <div class="frame-info">
                FRAME_ID: ${String(dataManager.currentFrame).padStart(4, '0')}<br>
                TIMESTAMP: ${timestamp}<br>
                TARGETS: ${String(dataManager.currentObjects.length).padStart(2, '0')}<br>
                STATUS: OPERATIONAL
            </div>
        `;
        
        dataManager.currentObjects.forEach((obj, index) => {
            const center = dataManager.getObjectCenter(obj);
            const isHighlighted = index === dataManager.hoveredObjectIndex;
            const targetStatus = this.getTargetStatus(obj[9]);
            const targetId = generateObjectId(obj[0], index);
            const primaryColor = getObjectColor(obj[0], false);
            const secondaryColor = getObjectColor(obj[0], true);
            const objectName = getObjectName(obj[0]);
            
            html += `
                <div class="data-item ${isHighlighted ? 'highlighted' : ''}" 
                     onmouseover="window.handleObjectHover(${index})" 
                     onmouseout="window.handleObjectUnhover()">
                    <strong style="color: ${primaryColor};">${targetId}</strong>
                    <div class="data-item-line">CLASS: <span style="color: ${primaryColor}; font-weight: bold;">${objectName}</span></div>
                    <div class="data-item-line">POS_X: ${this.formatCoordinate(center.x)}</div>
                    <div class="data-item-line">POS_Y: ${this.formatCoordinate(center.y)}</div>
                    <div class="data-item-line">CONF: <span class="confidence">${this.formatConfidence(obj[9])}</span></div>
                    <div class="data-item-line">STAT: <span style="color: ${secondaryColor}; font-weight: bold;">${targetStatus}</span></div>
                </div>
            `;
        });

        // 添加系统诊断信息
        if (dataManager.currentObjects.length === 0) {
            html += `
                <div class="data-item">
                    <strong>SYS_MSG</strong>
                    <div class="data-item-line" style="color: #ffaa00;">NO TARGETS DETECTED</div>
                    <div class="data-item-line">SCANNING...</div>
                </div>
            `;
        }
        
        this.panel.innerHTML = html;
    }
}

export const createUIPanel = (element) => new UIPanel(element); 