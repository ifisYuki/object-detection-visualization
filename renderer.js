import { VISUAL_CONFIG, STYLE_CONFIG, COLOR_SCHEME, getObjectColor, getObjectName, generateObjectId } from './config.js';
import { dataManager } from './dataManager.js';

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    // 绘制网格系统
    drawGridSystem() {
        // 清空画布 - 纯黑色背景
        this.ctx.fillStyle = COLOR_SCHEME.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制主网格
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 0.5;
        
        const gridSize = 40;
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // 绘制主坐标轴（白色）
        this.ctx.strokeStyle = COLOR_SCHEME.PRIMARY;
        this.ctx.lineWidth = 1;
        
        // X轴
        this.ctx.beginPath();
        this.ctx.moveTo(VISUAL_CONFIG.MARGIN, this.canvas.height - VISUAL_CONFIG.MARGIN);
        this.ctx.lineTo(this.canvas.width - VISUAL_CONFIG.MARGIN, this.canvas.height - VISUAL_CONFIG.MARGIN);
        this.ctx.stroke();
        
        // Y轴
        this.ctx.beginPath();
        this.ctx.moveTo(VISUAL_CONFIG.MARGIN, this.canvas.height - VISUAL_CONFIG.MARGIN);
        this.ctx.lineTo(VISUAL_CONFIG.MARGIN, VISUAL_CONFIG.MARGIN);
        this.ctx.stroke();
        
        // 绘制坐标标记
        this.drawCoordinateMarkers();
        
        // 绘制中心十字线
        this.drawCenterCrosshairs();
    }

    // 绘制坐标标记
    drawCoordinateMarkers() {
        this.ctx.fillStyle = COLOR_SCHEME.PRIMARY;
        this.ctx.font = '10px JetBrains Mono, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const x = VISUAL_CONFIG.MARGIN + (i / steps) * (this.canvas.width - 2 * VISUAL_CONFIG.MARGIN);
            const y = this.canvas.height - VISUAL_CONFIG.MARGIN + 5;
            this.ctx.fillText((i / steps).toFixed(1), x, y);
        }
        
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        for (let i = 0; i <= steps; i++) {
            const x = VISUAL_CONFIG.MARGIN - 5;
            const y = this.canvas.height - VISUAL_CONFIG.MARGIN - (i / steps) * (this.canvas.height - 2 * VISUAL_CONFIG.MARGIN);
            this.ctx.fillText((i / steps).toFixed(1), x, y);
        }
    }

    // 绘制中心十字线
    drawCenterCrosshairs() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        // 垂直线
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, VISUAL_CONFIG.MARGIN);
        this.ctx.lineTo(centerX, this.canvas.height - VISUAL_CONFIG.MARGIN);
        this.ctx.stroke();
        
        // 水平线
        this.ctx.beginPath();
        this.ctx.moveTo(VISUAL_CONFIG.MARGIN, centerY);
        this.ctx.lineTo(this.canvas.width - VISUAL_CONFIG.MARGIN, centerY);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }

    // 转换坐标到画布空间
    transformToCanvas(point) {
        return [
            VISUAL_CONFIG.MARGIN + point[0] * (this.canvas.width - 2 * VISUAL_CONFIG.MARGIN),
            VISUAL_CONFIG.MARGIN + (1 - point[1]) * (this.canvas.height - 2 * VISUAL_CONFIG.MARGIN)
        ];
    }

    // 绘制目标锁定圈
    drawTargetReticle(centerX, centerY, radius, isLocked, primaryColor, secondaryColor) {
        // 使用主色绘制外圈和十字线
        this.ctx.strokeStyle = isLocked ? primaryColor : `${primaryColor}aa`;
        this.ctx.lineWidth = 1;
        
        // 外圈
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 十字线
        const crossSize = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - crossSize, centerY);
        this.ctx.lineTo(centerX + crossSize, centerY);
        this.ctx.moveTo(centerX, centerY - crossSize);
        this.ctx.lineTo(centerX, centerY + crossSize);
        this.ctx.stroke();
        
        // 角落标记 - 使用次要颜色
        this.ctx.strokeStyle = isLocked ? secondaryColor : `${secondaryColor}aa`;
        const cornerSize = 8;
        const corners = [
            [-1, -1], [1, -1], [1, 1], [-1, 1]
        ];
        
        corners.forEach(([dx, dy]) => {
            const x = centerX + dx * (radius + 20);
            const y = centerY + dy * (radius + 20);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + dy * cornerSize);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x + dx * cornerSize, y);
            this.ctx.stroke();
        });
    }

    // 绘制单个对象
    drawObject(obj, index) {
        const isHighlighted = index === dataManager.hoveredObjectIndex;
        const points = dataManager.getObjectPoints(obj);
        const canvasPoints = points.map(point => this.transformToCanvas(point));
        
        // 获取对象颜色
        const primaryColor = getObjectColor(obj[0], false);
        const secondaryColor = getObjectColor(obj[0], true);
        const strokeColor = isHighlighted ? primaryColor : `${primaryColor}cc`;
        
        // 绘制连接线（轨迹效果）
        if (canvasPoints.length >= 4) {
            this.ctx.strokeStyle = `${primaryColor}66`;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([2, 2]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(canvasPoints[0][0], canvasPoints[0][1]);
            for (let i = 1; i < canvasPoints.length; i++) {
                this.ctx.lineTo(canvasPoints[i][0], canvasPoints[i][1]);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // 绘制边界框
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = isHighlighted ? 2 : 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(canvasPoints[0][0], canvasPoints[0][1]);
        for (let i = 1; i < canvasPoints.length; i++) {
            this.ctx.lineTo(canvasPoints[i][0], canvasPoints[i][1]);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        
        // 计算中心点
        const center = dataManager.getObjectCenter(obj);
        const canvasCenter = this.transformToCanvas([center.x, center.y]);
        
        // 绘制目标锁定圈
        const isLocked = obj[9] > 0.8;
        this.drawTargetReticle(canvasCenter[0], canvasCenter[1], VISUAL_CONFIG.POINT_RADIUS, 
                              isLocked || isHighlighted, primaryColor, secondaryColor);
        
        // 绘制中心点
        this.ctx.beginPath();
        this.ctx.arc(
            canvasCenter[0], 
            canvasCenter[1], 
            isHighlighted ? VISUAL_CONFIG.POINT_RADIUS + 2 : VISUAL_CONFIG.POINT_RADIUS, 
            0, 
            Math.PI * 2
        );
        this.ctx.fillStyle = strokeColor;
        this.ctx.fill();
        
        // 添加目标标签
        this.ctx.fillStyle = primaryColor;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        this.ctx.font = isHighlighted ? 'bold 12px JetBrains Mono' : '10px JetBrains Mono';
        
        const label = generateObjectId(obj[0], index);
        const subLabel = `${getObjectName(obj[0])} [${(obj[9] * 100).toFixed(0)}%]`;
        
        this.ctx.fillText(label, canvasCenter[0] + 15, canvasCenter[1] - 5);
        this.ctx.font = '8px JetBrains Mono';
        this.ctx.fillStyle = secondaryColor;
        this.ctx.fillText(subLabel, canvasCenter[0] + 15, canvasCenter[1] + 8);
    }

    // 绘制所有对象
    drawObjects() {
        if (!dataManager.currentObjects || dataManager.currentObjects.length === 0) return;
        dataManager.currentObjects.forEach((obj, index) => this.drawObject(obj, index));
    }

    // 完整重绘
    render() {
        this.drawGridSystem();
        this.drawObjects();
    }
}

export const createRenderer = (canvas) => new Renderer(canvas); 