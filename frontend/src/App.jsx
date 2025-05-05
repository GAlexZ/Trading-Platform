import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import NFTDetailView from "./pages/NFTDetailView";
import CreateListingPage from "./pages/CreateListingPage";
import AdminPage from "./pages/AdminPage";
import MyCollectionPage from "./pages/MyCollectionPage";
import { Web3Provider, useWeb3 } from "./context/Web3Context";
import { ListingsProvider } from "./context/ListingsContext";
import "./index.css";

// Admin Route component that checks if the user is the contract owner
const AdminRoute = ({ children }) => {
  const { account, pokemonCardContract } = useWeb3();
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);

  useEffect(() => {
    const checkOwnership = async () => {
      setIsCheckingOwner(true);
      if (account && pokemonCardContract) {
        try {
          const owner = await pokemonCardContract.owner();
          setIsOwner(owner.toLowerCase() === account.toLowerCase());
        } catch (error) {
          console.error("Error checking contract ownership:", error);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
      setIsCheckingOwner(false);
    };

    checkOwnership();
  }, [account, pokemonCardContract]);

  // If still checking, show loading
  if (isCheckingOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not owner, redirect to marketplace
  return isOwner ? children : <Navigate to="/marketplace" replace />;
};

const AppContent = () => {
  // App-level state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:listingId" element={<NFTDetailView />} />
          <Route path="/create-listing" element={<CreateListingPage />} />
          <Route path="/collection" element={<MyCollectionPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Web3Provider>
        <ListingsProvider>
          <AppContent />
        </ListingsProvider>
      </Web3Provider>
    </Router>
  );
};

export default App;
