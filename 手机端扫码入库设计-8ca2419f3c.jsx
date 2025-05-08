import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Calendar, Check, AlertTriangle, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const BarcodeScanner = () => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [stickCount, setStickCount] = useState(12);
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // 初始化日期为当天
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, []);

  // 模拟扫码动画
  const startScan = () => {
    setScanStatus('scanning');
    
    // 清除之前的动画
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    let pos = 0;
    let direction = 1;
    const speed = 2;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 绘制扫描框
      ctx.strokeStyle = '#008CFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(10, 10, width - 20, height - 20);
      
      // 绘制扫描线
      ctx.setLineDash([]);
      ctx.strokeStyle = '#00C853';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, pos);
      ctx.lineTo(width - 20, pos);
      ctx.stroke();
      
      pos += speed * direction;
      
      if (pos >= height - 20 || pos <= 20) {
        direction *= -1;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 3秒后模拟扫描完成
    setTimeout(() => {
      if (Math.random() > 0.2) {
        setScanStatus('success');
      } else {
        setScanStatus('error');
        setError('扫描失败，请重试');
      }
      cancelAnimationFrame(animationRef.current);
    }, 3000);
  };

  const handleSubmit = () => {
    // 验证输入
    if (stickCount < 1 || stickCount > 50) {
      setError('滤棒格数必须在1-50之间');
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    if (selectedDate > today) {
      setError('不能选择未来日期');
      return;
    }

    if (selectedDate < sevenDaysAgo) {
      setError('只能选择过去7天内的日期');
      return;
    }

    setError('');
    // 这里可以处理提交逻辑
    console.log({
      barcode: 'FB20240315-12',
      stickCount,
      date
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* 扫码区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-medium text-[#333] mb-4">扫描滤棒塑格二维码</h1>
        
        <div 
          className="relative w-full max-w-[600px] h-[40vh] max-h-[300px] bg-white rounded-lg overflow-hidden shadow-sm flex items-center justify-center"
          onClick={startScan}
        >
          {scanStatus === 'idle' && (
            <div className="flex flex-col items-center">
              <QrCode size={48} className="text-[#008CFF] mb-2" />
              <p className="text-[#666]">点击开始扫描</p>
            </div>
          )}
          
          {scanStatus === 'scanning' && (
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
              width={300}
              height={300}
            />
          )}
          
          {scanStatus === 'success' && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Check size={24} className="text-green-600" />
              </div>
              <p className="text-green-600">扫描成功</p>
              <p className="text-sm text-[#666] mt-1">FB20240315-12</p>
            </motion.div>
          )}
          
          {scanStatus === 'error' && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <p className="text-red-600">扫描失败</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-1 gap-4 max-w-[600px] mx-auto">
          {/* 滤棒格数输入 */}
          <div>
            <label className="block text-[#666] text-sm mb-1">滤棒格数</label>
            <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
              <button 
                className="bg-[#F0F2F5] p-2 text-[#666]"
                onClick={() => setStickCount(prev => Math.max(1, prev - 1))}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={stickCount}
                onChange={(e) => setStickCount(Number(e.target.value))}
                className="flex-1 p-2 text-center border-0 focus:ring-0"
              />
              <button 
                className="bg-[#F0F2F5] p-2 text-[#666]"
                onClick={() => setStickCount(prev => Math.min(50, prev + 1))}
              >
                <Plus size={16} />
              </button>
              <span className="bg-[#F0F2F5] px-3 py-2 text-[#666]">格</span>
            </div>
          </div>

          {/* 入库日期选择 */}
          <div>
            <label className="block text-[#666] text-sm mb-1">入库日期</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-[#E5E7EB] rounded-lg pr-10"
              />
              <Calendar size={20} className="absolute right-3 top-2.5 text-[#666]" />
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4">
          <div className="max-w-[600px] mx-auto py-2 px-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* 确认按钮 */}
      <div className="p-4">
        <button
          onClick={handleSubmit}
          disabled={scanStatus !== 'success'}
          className={`w-full max-w-[600px] mx-auto py-4 rounded-lg text-white font-medium flex items-center justify-center ${
            scanStatus === 'success' ? 'bg-[#008CFF] hover:bg-[#0069CC]' : 'bg-[#999]'
          }`}
        >
          确认入库
        </button>
      </div>

      {/* 页脚 */}
      <div className="py-4 px-6 bg-[#F0F2F5] border-t border-[#E5E7EB] text-center">
        <p className="text-xs text-[#666]">
          created by <a href="https://space.coze.cn" className="text-[#008CFF] hover:text-[#0059B3]">coze space</a>
        </p>
        <p className="text-xs text-[#666] mt-1">页面内容均由 AI 生成，仅供参考</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;