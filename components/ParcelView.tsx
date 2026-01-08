import React, { useState } from 'react';
import { Parcel, Customer, Driver, ParcelStatus, PaymentMethod, ParcelItem } from '../types';
import ParcelRequestModal from './ParcelRequestModal';
import ParcelStatusTracker from './ParcelStatusTracker';
import NewPaymentModal from './NewPaymentModal'; // Re-using this modal
import { useToast } from '../App';
import Tabs from './Tabs';
import { updateParcel } from '../services/databaseService'; // We need this now

interface ParcelViewProps {
  parcels: Parcel[];
  drivers: Driver[];
  customer: Customer;
  onCreateParcel: (parcelData: Omit<Parcel, 'id' | 'deliveryFee' | 'status'>) => Promise<void>;
}

const ParcelView: React.FC<ParcelViewProps> = ({ parcels, drivers, customer, onCreateParcel }) => {
  const [isParcelRequestModalOpen, setIsParcelRequestModalOpen] = useState(false);
  const [paymentParcel, setPaymentParcel] = useState<Parcel | null>(null);
  const { addToast } = useToast();

  const handleCreateParcel = async (pickupAddress: string, dropoffAddress: string, parcels: ParcelItem[]) => {
    const newParcelData = {
      customerId: customer.id,
      pickupAddress,
      dropoffAddress,
      parcels,
    };
    await onCreateParcel(newParcelData);
    setIsParcelRequestModalOpen(false);
    addToast('Parcel request created successfully!', 'success');
  };

  const handlePaymentConfirm = async (parcelId: string, paymentMethod: PaymentMethod, deliveryFee: number, total: number) => {
    const status = paymentMethod === PaymentMethod.PAYSHAP 
        ? ParcelStatus.AWAITING_DRIVER_CONFIRMATION 
        : ParcelStatus.IN_TRANSIT;
    
    try {
        await updateParcel(parcelId, { 
            paymentMethod, 
            status,
            deliveryFee,
            total
        });
        setPaymentParcel(null);
        addToast('Payment method confirmed!', 'success');
    } catch (error) {
        addToast('Failed to confirm payment method.', 'error');
    }
  };

  const handleCustomerPayshapConfirmation = async (parcelId: string) => {
      try {
          await updateParcel(parcelId, { status: ParcelStatus.AWAITING_DRIVER_CONFIRMATION });
          addToast('Payment confirmation sent to driver!', 'success');
      } catch (error) {
          addToast('Failed to confirm payment.', 'error');
      }
  };

  const activeParcels = parcels.filter(p => p.status !== ParcelStatus.DELIVERED);
  const completedParcels = parcels.filter(p => p.status === ParcelStatus.DELIVERED);

  const TABS = ['Active Parcels', 'Parcel History'];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parcel Collection</h1>
        <button
          onClick={() => setIsParcelRequestModalOpen(true)}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold shadow-md active:scale-95"
        >
          Request a Parcel Pickup
        </button>
      </div>

      <Tabs tabs={TABS} defaultTab="Active Parcels">
        {(activeTab) => (
          <div>
            {activeTab === 'Active Parcels' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {activeParcels.length > 0 ? (
                  activeParcels.map(parcel => {
                      const driver = drivers.find(d => d.id === parcel.driverId)
                      return <ParcelStatusTracker 
                        key={parcel.id} 
                        parcel={parcel} 
                        driver={driver}
                        onPayNow={setPaymentParcel} 
                        onConfirmPayshapPayment={handleCustomerPayshapConfirmation} 
                      />
                  })
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10">You have no active parcel requests.</p>
                )}
              </div>
            )}

            {activeTab === 'Parcel History' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {completedParcels.length > 0 ? (
                  completedParcels.map(parcel => {
                    const driver = drivers.find(d => d.id === parcel.driverId)
                    return <ParcelStatusTracker 
                      key={parcel.id} 
                      parcel={parcel} 
                      driver={driver}
                      onPayNow={() => {}} 
                      onConfirmPayshapPayment={() => {}} 
                    />
                  })
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10">Your parcel history is empty.</p>
                )}
              </div>
            )}
          </div>
        )}
      </Tabs>

      {isParcelRequestModalOpen && (
        <ParcelRequestModal
          customer={customer}
          onClose={() => setIsParcelRequestModalOpen(false)}
          onCreateParcel={handleCreateParcel}
        />
      )}

      {paymentParcel && paymentParcel.driverId && (
        <NewPaymentModal
          order={paymentParcel} // The modal is flexible enough to handle a Parcel object
          driver={drivers.find(d => d.id === paymentParcel.driverId)!}
          onClose={() => setPaymentParcel(null)}
          onConfirmPayment={handlePaymentConfirm}
          isParcel={true}
        />
      )}
    </div>
  );
};

export default ParcelView;
