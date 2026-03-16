import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, Medicine, Batch, Transaction, Category, Supplier, User } from "../types";
import { initialData } from "../data/mockData";

interface AppContextType extends AppState {
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, batch: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("medical_app_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem("medical_app_data", JSON.stringify(state));
  }, [state]);

  const addMedicine = (medicine: Medicine) => {
    setState((prev) => ({ ...prev, medicines: [...prev.medicines, medicine] }));
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setState((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m)),
    }));
  };

  const deleteMedicine = (id: string) => {
    setState((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((m) => m.id !== id),
      batches: prev.batches.filter((b) => b.medicineId !== id),
    }));
  };

  const addBatch = (batch: Batch) => {
    setState((prev) => ({ ...prev, batches: [...prev.batches, batch] }));
  };

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setState((prev) => ({
      ...prev,
      batches: prev.batches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const deleteBatch = (id: string) => {
    setState((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.id !== id),
    }));
  };

  const addTransaction = (transaction: Transaction) => {
    setState((prev) => {
      // Update batch quantity based on transaction
      const updatedBatches = prev.batches.map((b) => {
        if (b.id === transaction.batchId) {
          let newQuantity = b.quantity;
          if (transaction.type === "IMPORT") {
            newQuantity += transaction.quantity;
          } else if (transaction.type === "EXPORT" || transaction.type === "DISPENSE" || transaction.type === "TRANSFER") {
            newQuantity -= transaction.quantity;
          }
          return { ...b, quantity: newQuantity };
        }
        return b;
      });

      return {
        ...prev,
        transactions: [transaction, ...prev.transactions],
        batches: updatedBatches,
      };
    });
  };

  const resetData = () => {
    setState(initialData);
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        addBatch,
        updateBatch,
        deleteBatch,
        addTransaction,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
