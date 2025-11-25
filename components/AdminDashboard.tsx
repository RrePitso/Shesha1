
import React, { useState, useMemo } from 'react';
import { Restaurant, Subscription, Order, Driver, OrderStatus } from '../types';
import { ALICE_AREAS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BellIcon, CheckCircleIcon, StarIcon, FireIcon, KeyIcon } from '@heroicons/react/24/solid';
import PasswordChangeModal from './PasswordChangeModal';

interface AdminDashboardProps {
  orders: Order[];
  restaurants: Restaurant[];
  drivers: Driver[];
  onUpdateRestaurant: (restaurant: Restaurant) => void;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

// --- Helper Types ---
type DailyData = { date: string; totalRevenue: number; orderCount: number; };

// --- Helper Functions ---
const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
const isDueSoon = (dueDate: string, days: number = 7) => {
  const due = new Date(dueDate);
  const today = new Date();
  const soonDate = new Date();
  soonDate.setDate(today.getDate() + days);
  return due >= today && due <= soonDate;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, restaurants, drivers, onUpdateRestaurant, onChangePassword }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // --- Combined Memoized Calculations ---
  const { 
    revenueData, orderData, totalRevenue, totalOrders, averageOrderValue,
    overdue, dueSoon,
    restaurantLeaderboard,
    driverLeaderboard,
    areaHeatmap
  } = useMemo(() => {
    const dataByDate: Record<string, DailyData> = {};
    const areaCounts: Record<string, number> = ALICE_AREAS.reduce((acc, area) => ({ ...acc, [area]: 0 }), {});

    orders.forEach(order => {
      // Date-based data
      const date = formatDate(order.createdAt);
      if (!dataByDate[date]) {
        dataByDate[date] = { date, totalRevenue: 0, orderCount: 0 };
      }
      dataByDate[date].totalRevenue += order.total;
      dataByDate[date].orderCount += 1;

      // --- FIX: Handle multiple possible structures for customerAddress --- 
      let addressString: string | undefined;
      const addressField = order.customerAddress;

      if (typeof addressField === 'object' && addressField !== null && 'label' in addressField) {
          addressString = (addressField as any).label;
      } else if (typeof addressField === 'string') {
          addressString = addressField;
      }

      if (addressString) {
        const matchedArea = ALICE_AREAS.find(area => addressString.includes(area));
        if (matchedArea) {
          areaCounts[matchedArea]++;
        }
      }
    });
    
    const chartData = Object.values(dataByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const overdue = restaurants.filter(r => r.subscription && isOverdue(r.subscription.dueDate));
    const dueSoon = restaurants.filter(r => r.subscription && isDueSoon(r.subscription.dueDate));

    const restaurantLeaderboard = restaurants.map(r => {
        const restaurantOrders = orders.filter(o => o.restaurantId === r.id);
        const totalRevenue = restaurantOrders.reduce((sum, o) => sum + o.total, 0);
        return { ...r, totalRevenue, orderCount: restaurantOrders.length };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

    const driverLeaderboard = drivers.map(d => {
        const driverDeliveries = orders.filter(o => o.driverId === d.id && o.status === OrderStatus.DELIVERED);
        const totalEarnings = Object.values(d.earnings || {}).reduce((sum: number, amount: number) => sum + amount, 0);
        return { ...d, deliveryCount: driverDeliveries.length, totalEarnings };
    }).sort((a, b) => b.deliveryCount - a.deliveryCount).slice(0, 5);
    
    const maxAreaOrders = Math.max(...Object.values(areaCounts));
    const areaHeatmap = ALICE_AREAS.map(area => ({
      name: area,
      count: areaCounts[area],
      intensity: maxAreaOrders > 0 ? (areaCounts[area] / maxAreaOrders) * 100 : 0,
    }));

    return {
      revenueData: chartData.map(d => ({ date: d.date, Revenue: d.totalRevenue })),
      orderData: chartData.map(d => ({ date: d.date, Orders: d.orderCount })),
      totalRevenue, totalOrders, averageOrderValue, overdue, dueSoon,
      restaurantLeaderboard,
      driverLeaderboard,
      areaHeatmap,
    };
  }, [orders, restaurants, drivers]);

  // --- Handlers ---
  const handleOpenModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSubscriptionAmount(restaurant.subscription?.amount.toString() || '');
    setDueDate(restaurant.subscription?.dueDate ? new Date(restaurant.subscription.dueDate).toISOString().split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveSubscription = () => {
    if (!selectedRestaurant) return;
    const updatedSub: Subscription = {
      amount: parseFloat(subscriptionAmount) || 0,
      dueDate: new Date(dueDate).toISOString(),
      history: selectedRestaurant.subscription?.history || [],
      lastPaidDate: selectedRestaurant.subscription?.lastPaidDate,
    };
    onUpdateRestaurant({ ...selectedRestaurant, subscription: updatedSub });
    handleCloseModal();
  };

  const handleLogPayment = () => {
    if (!selectedRestaurant?.subscription) return;
    const currentSub = selectedRestaurant.subscription;
    const nextDueDate = new Date(currentSub.dueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    const updatedSub: Subscription = {
      ...currentSub,
      dueDate: nextDueDate.toISOString(),
      lastPaidDate: new Date().toISOString(),
      history: [...(currentSub.history || []), { date: new Date().toISOString(), amount: currentSub.amount }],
    };
    onUpdateRestaurant({ ...selectedRestaurant, subscription: updatedSub });
    handleCloseModal();
  };

  // --- Color utility for heatmap ---
  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (intensity < 10) return 'bg-green-100 dark:bg-green-900';
    if (intensity < 30) return 'bg-green-200 dark:bg-green-800';
    if (intensity < 50) return 'bg-green-300 dark:bg-green-700';
    if (intensity < 70) return 'bg-green-400 dark:bg-green-600';
    return 'bg-green-500 dark:bg-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center mb-8"
        >
          <KeyIcon className="h-5 w-5 mr-2" />
          Change Password
        </button>
      </div>

      {/* --- Section 1: Payment Reminders --- */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-red-500 pb-2 flex items-center"><BellIcon className="h-8 w-8 mr-3" />Payment Reminders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-red-500">Overdue</h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md max-h-48 overflow-y-auto">
              {overdue.length > 0 ? (
                <ul>{overdue.map(r => <li key={r.id} className="py-1">{r.name} - Due: {formatDate(r.subscription!.dueDate)}</li>)}</ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No overdue payments.</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-yellow-500">Due Soon (Next 7 Days)</h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md max-h-48 overflow-y-auto">
              {dueSoon.length > 0 ? (
                <ul>{dueSoon.map(r => <li key={r.id} className="py-1">{r.name} - Due: {formatDate(r.subscription!.dueDate)}</li>)}</ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No payments due soon.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Key Performance Indicators --- */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-blue-500 pb-2">Platform Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold text-green-500">R{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Orders</h3>
            <p className="text-4xl font-bold text-blue-500">{totalOrders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Average Order Value</h3>
            <p className="text-4xl font-bold text-purple-500">R{averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={400}><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="#4A5568" /><XAxis dataKey="date" stroke="#A0AEC0" /><YAxis stroke="#A0AEC0" tickFormatter={(val) => `R${val}`} /><Tooltip contentStyle={{ backgroundColor: '#1A202C' }} /><Legend /><Line type="monotone" dataKey="Revenue" stroke="#48BB78" /></LineChart></ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Orders Over Time</h3>
            <ResponsiveContainer width="100%" height={400}><LineChart data={orderData}><CartesianGrid strokeDasharray="3 3" stroke="#4A5568" /><XAxis dataKey="date" stroke="#A0AEC0" /><YAxis stroke="#A0AEC0" /><Tooltip contentStyle={{ backgroundColor: '#1A202C' }} /><Legend /><Line type="monotone" dataKey="Orders" stroke="#4299E1" /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* --- Section 3: Activity Heatmap --- */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-green-500 pb-2 flex items-center"><FireIcon className="h-8 w-8 mr-3"/>Area Activity Heatmap</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {areaHeatmap.map(area => (
                    <div 
                        key={area.name}
                        className={`p-4 rounded-lg text-center flex flex-col justify-center items-center transition-all duration-300 ${getHeatmapColor(area.intensity)}`}
                    >
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{area.name}</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{area.count} orders</span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- Section 4: Leaderboards --- */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-purple-500 pb-2">Leaderboards</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Restaurants */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Top 5 Restaurants (by Revenue)</h3>
            <table className="w-full text-left"><thead><tr><th className="py-2">Rank</th><th className="py-2">Name</th><th className="py-2">Revenue</th><th className="py-2">Orders</th><th className="py-2">Rating</th></tr></thead>
              <tbody>
                {restaurantLeaderboard.map((r, i) => (
                  <tr key={r.id} className="border-t dark:border-gray-700"> 
                    <td className="py-2 font-bold">#{i + 1}</td>
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">R{r.totalRevenue.toFixed(2)}</td>
                    <td className="py-2">{r.orderCount}</td>
                    <td className="py-2 flex items-center">{r.rating.toFixed(1)} <StarIcon className="h-5 w-5 ml-1 text-yellow-500"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Top Drivers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Top 5 Drivers (by Deliveries)</h3>
            <table className="w-full text-left"><thead><tr><th className="py-2">Rank</th><th className="py-2">Name</th><th className="py-2">Deliveries</th><th className="py-2">Earnings</th><th className="py-2">Rating</th></tr></thead>
              <tbody>
                {driverLeaderboard.map((d, i) => (
                  <tr key={d.id} className="border-t dark:border-gray-700">
                    <td className="py-2 font-bold">#{i + 1}</td>
                    <td className="py-2">{d.name}</td>
                    <td className="py-2">{d.deliveryCount}</td>
                    <td className="py-2">R{d.totalEarnings.toFixed(2)}</td>
                    <td className="py-2 flex items-center">{d.rating.toFixed(1)} <StarIcon className="h-5 w-5 ml-1 text-yellow-500"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- Section 5: Restaurant Subscriptions --- */}
      <section>
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-indigo-500 pb-2">Restaurant Subscriptions</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full text-left"><thead><tr><th className="py-3 px-4">Restaurant</th><th className="py-3 px-4">Sub Amount</th><th className="py-3 px-4">Due Date</th><th className="py-3 px-4 text-center">Actions</th></tr></thead>
            <tbody>
              {restaurants.map(restaurant => (
                <tr key={restaurant.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium">{restaurant.name}</td>
                  <td className="py-3 px-4">{restaurant.subscription ? `R${restaurant.subscription.amount}` : 'Not Set'}</td>
                  <td className="py-3 px-4">{restaurant.subscription ? formatDate(restaurant.subscription.dueDate) : 'N/A'}</td>
                  <td className="py-3 px-4 text-center"><button onClick={() => handleOpenModal(restaurant)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Modals --- */}
      {isModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">Manage: {selectedRestaurant.name}</h3>
            <div className="space-y-4 mb-8">
              <div><label>Subscription Amount (R)</label><input type="number" value={subscriptionAmount} onChange={(e) => setSubscriptionAmount(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded"/></div>
              <div><label>Next Due Date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded"/></div>
            </div>
            <div className="flex flex-col space-y-3">
              <button onClick={handleLogPayment} className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"><CheckCircleIcon className="h-5 w-5 mr-2" /> Log Payment & Set Next Month</button>
              <button onClick={handleSaveSubscription} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">Save Changes</button>
              <button onClick={handleCloseModal} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <PasswordChangeModal
          onClose={() => setIsPasswordModalOpen(false)}
          onChangePassword={onChangePassword}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
