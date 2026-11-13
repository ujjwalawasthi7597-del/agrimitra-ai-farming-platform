import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Plus,
  Trash2,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  X,
  Calendar,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface ExpensesViewProps {
  lang: LanguageCode;
  user: any;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ lang }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'harvests' | 'charts'>('charts');

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddHarvestModal, setShowAddHarvestModal] = useState(false);

  // Add expense form
  const [expCropId, setExpCropId] = useState('');
  const [expCategory, setExpCategory] = useState('Seeds');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');
  const [expPayment, setExpPayment] = useState('UPI');

  // Add harvest form
  const [harvCropName, setHarvCropName] = useState('Wheat (गेहूं)');
  const [harvPlotName, setHarvPlotName] = useState('North Field');
  const [harvDate, setHarvDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvQty, setHarvQty] = useState('');
  const [harvRate, setHarvRate] = useState('');
  const [harvBuyer, setHarvBuyer] = useState('Mandi APMC');
  const [harvSlip, setHarvSlip] = useState('');

  const t = (key: string) => getTranslation(lang, key);

  const fetchFinanceData = async () => {
    try {
      const [expRes, harvRes, anaRes, cropRes] = await Promise.all([
        api.finance.getExpenses(),
        api.finance.getHarvests(),
        api.finance.getAnalytics(),
        api.crops.getAll(),
      ]);
      setExpenses(expRes.expenses || []);
      setHarvests(harvRes.harvests || []);
      setAnalytics(anaRes);
      setCrops(cropRes.crops || []);
      if (cropRes.crops && cropRes.crops.length > 0) {
        setExpCropId(cropRes.crops[0]._id);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCategory || !expAmount || !expDate) return;
    try {
      await api.finance.createExpense({
        cropId: expCropId,
        category: expCategory,
        amount: parseFloat(expAmount),
        date: expDate,
        description: expDesc,
        paymentMode: expPayment,
      });
      setShowAddExpenseModal(false);
      setExpAmount('');
      setExpDesc('');
      fetchFinanceData();
    } catch (err) {
      console.error('Failed to save expense:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.finance.deleteExpense(id);
      fetchFinanceData();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvCropName || !harvQty || !harvRate || !harvDate) return;
    try {
      await api.finance.createHarvest({
        cropName: harvCropName,
        plotName: harvPlotName,
        harvestDate: harvDate,
        quantityQuintals: parseFloat(harvQty),
        sellingPricePerQuintal: parseFloat(harvRate),
        buyerName: harvBuyer,
        mandiSlipNo: harvSlip,
      });
      setShowAddHarvestModal(false);
      setHarvQty('');
      setHarvRate('');
      setHarvSlip('');
      fetchFinanceData();
    } catch (err) {
      console.error('Failed to save harvest:', err);
    }
  };

  const handleDeleteHarvest = async (id: string) => {
    try {
      await api.finance.deleteHarvest(id);
      fetchFinanceData();
    } catch (err) {
      console.error('Failed to delete harvest record:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
            <span>{t('expenses')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Track seed, fertilizer, and labor inputs against Mandi harvest revenues and net farm profitability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{t('addExpense')}</span>
          </button>
          <button
            onClick={() => setShowAddHarvestModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Record Mandi Sale</span>
          </button>
        </div>
      </div>

      {/* P&L Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            {t('totalRevenue')}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            {analytics?.totalHarvestQuintals || 0} Quintals Harvested
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            {t('totalExpenses')}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            ₹{(analytics?.totalExpense || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-500 block mt-1">
            {expenses.length} Recorded Entries
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            {t('netProfit')}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            ₹{(analytics?.netProfit || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            Positive Farm Cashflow
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            {t('profitMargin')}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {analytics?.profitMargin || 0}%
          </div>
          <span className="text-[11px] text-gray-500 block mt-1">Net ROI on Cultivation</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('charts')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'charts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Financial Visuals & Charts</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Expenses Log ({expenses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('harvests')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'harvests'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Harvest & Mandi Sales ({harvests.length})</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Cultivation Expenses by Category</span>
            </h3>

            <div className="h-72 w-full">
              {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {analytics.categoryBreakdown.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No expense records yet
                </div>
              )}
            </div>
          </div>

          {/* Crop Revenue vs Expense Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Revenue vs Expense by Crop</span>
            </h3>

            <div className="h-72 w-full">
              {analytics?.cropFinancials && analytics.cropFinancials.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.cropFinancials} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`]} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expense (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No crop financial data yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 border-b border-emerald-100 text-gray-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Crop</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Amount (₹)</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{exp.date}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{exp.cropName}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{exp.description || '—'}</td>
                    <td className="p-4 text-gray-600">{exp.paymentMode || 'Cash'}</td>
                    <td className="p-4 font-extrabold text-gray-900 text-right">
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp._id)}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'harvests' && (
        <div className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 border-b border-emerald-100 text-gray-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Harvest Date</th>
                  <th className="p-4">Crop</th>
                  <th className="p-4">Field Plot</th>
                  <th className="p-4">Quantity (Qtl)</th>
                  <th className="p-4">Rate (₹/Qtl)</th>
                  <th className="p-4">Mandi Buyer / Slip</th>
                  <th className="p-4 text-right">Total Revenue (₹)</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {harvests.map((harv) => (
                  <tr key={harv._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{harv.harvestDate}</td>
                    <td className="p-4 font-bold text-emerald-800">{harv.cropName}</td>
                    <td className="p-4 text-gray-600">{harv.plotName}</td>
                    <td className="p-4 font-extrabold text-gray-900">{harv.quantityQuintals}</td>
                    <td className="p-4 text-gray-700">₹{harv.sellingPricePerQuintal}</td>
                    <td className="p-4 text-gray-600">
                      {harv.buyerName}{' '}
                      {harv.mandiSlipNo && <span className="text-gray-400">({harv.mandiSlipNo})</span>}
                    </td>
                    <td className="p-4 font-extrabold text-emerald-700 text-right">
                      ₹{Number(harv.totalRevenue).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteHarvest(harv._id)}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <IndianRupee className="w-5 h-5 text-lime-400" />
                <h3 className="font-extrabold text-lg">{t('addExpense')}</h3>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 rounded-full bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Seeds">Seeds (बीज)</option>
                    <option value="Fertilizers">Fertilizers (उर्वरक/खाद)</option>
                    <option value="Pesticides">Pesticides (कीटनाशक)</option>
                    <option value="Labour">Labour (मजदूरी)</option>
                    <option value="Machinery">Machinery / Tractor</option>
                    <option value="Irrigation">Irrigation / Electricity</option>
                    <option value="Transport">Transport / Mandi</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Crop
                  </label>
                  <select
                    value={expCropId}
                    onChange={(e) => setExpCropId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="">General Farm</option>
                    {crops.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.cropName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Payment Mode
                </label>
                <select
                  value={expPayment}
                  onChange={(e) => setExpPayment(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / PhonePe / GPay</option>
                  <option value="KCC Debit">KCC Debit</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description / Remarks
                </label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. 3 sacks Urea + DAP from IFFCO dealer"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-2"
              >
                Record Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Harvest Modal */}
      {showAddHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-lime-400" />
                <h3 className="font-extrabold text-lg">Record Mandi Sale</h3>
              </div>
              <button
                onClick={() => setShowAddHarvestModal(false)}
                className="p-1 rounded-full bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHarvest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Crop Name
                  </label>
                  <input
                    type="text"
                    required
                    value={harvCropName}
                    onChange={(e) => setHarvCropName(e.target.value)}
                    placeholder="e.g. Wheat (गेहूं)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={harvDate}
                    onChange={(e) => setHarvDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Quantity ({t('quintals')})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={harvQty}
                    onChange={(e) => setHarvQty(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Rate (₹ / Quintal)
                  </label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={harvRate}
                    onChange={(e) => setHarvRate(e.target.value)}
                    placeholder="e.g. 2275 (MSP)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Buyer / Mandi
                  </label>
                  <input
                    type="text"
                    value={harvBuyer}
                    onChange={(e) => setHarvBuyer(e.target.value)}
                    placeholder="e.g. APMC Grain Market"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Mandi Slip No.
                  </label>
                  <input
                    type="text"
                    value={harvSlip}
                    onChange={(e) => setHarvSlip(e.target.value)}
                    placeholder="e.g. J-Form 9821"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-2"
              >
                Save Harvest Sale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
