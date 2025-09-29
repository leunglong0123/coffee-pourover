import React from 'react';

const FourSixMethodInfo: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-700 mb-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🏆</span>
        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
          世界冠軍咖啡師粕谷哲的「4:6手沖法」
        </h3>
      </div>

      <div className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
        <p>
          <strong>特點：</strong>這是2016年世界沖煮冠軍粕谷哲（Tetsu Kasuya）創造的經典手沖方法。
          名稱來源於前40%的水用於調節酸甜平衡，後60%的水用於調節濃度強弱。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">理想風味特色</h4>
            <ul className="space-y-1 text-xs">
              <li>• 甜味突出，口感溫和</li>
              <li>• 酸度平衡，苦味較低</li>
              <li>• 層次豐富，風味清晰</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">推薦咖啡豆</h4>
            <ul className="space-y-1 text-xs">
              <li>• 高品質淺烘焙咖啡豆</li>
              <li>• 果香調性明顯的豆子</li>
              <li>• 單一產區精品咖啡</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <p className="text-xs">
            <strong>重要提示：</strong>使用慢速流速的濾杯（如Hario V60），注水後可輕輕搖晃濾杯讓咖啡粉與水更好混合，
            提高萃取均勻度。每次注水的時間控制是成功的關鍵！
          </p>
        </div>
      </div>
    </div>
  );
};

export default FourSixMethodInfo;