
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <header className="p-4">
        <img src="/2-822f66d1.ico" alt="iDelivery Logo" className="h-24 w-auto"/>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-5xl font-bold mb-4">Welcome to iDelivery</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl">
          Your one-stop solution for food delivery in Alice. Get your favorite meals delivered to your door, fast and affordably.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mb-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Affordable Delivery</h2>
            <p className="text-gray-400">Our drivers charge from as little as <span className="font-bold text-primary-orange">R20</span>, making delivery more accessible than ever.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">All of Alice, Soon!</h2>
            <p className="text-gray-400">We're on a mission to partner with every restaurant in Alice. The future of local food is here.</p>
          </div>
        </div>

        <button 
          onClick={onGetStarted}
          className="bg-primary-orange hover:bg-secondary-orange text-white font-bold py-4 px-8 rounded-full text-lg transition duration-300"
        >
          Login or Sign Up
        </button>
      </main>
      <footer className="p-4 text-center text-gray-500">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <a href="https://wa.me/27680157156" target="_blank" rel="noopener noreferrer" className="hover:text-primary-orange">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.871 1.213 3.07.149.198 2.096 3.257 2.809 2.162 3.722 2.162.83.199 1.265.124.904-.521 1.028-.967.124-.867.099-1.04z"/></svg>
          </a>
          <a href="mailto:ofentsepitsopop@gmail.com" className="hover:text-primary-orange">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
          </a>
        </div>
        &copy; {new Date().getFullYear()} iDelivery. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
