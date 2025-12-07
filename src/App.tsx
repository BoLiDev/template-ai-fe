import { FC } from 'react';

const App: FC = () => {
  return (
    <div
      data-testid="app"
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-gray-100 italic"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md px-12 py-16 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Hello React
        </h1>
        <p className="text-lg text-gray-400 font-light">
          Start Your React Project Here
        </p>
      </div>
    </div>
  );
};

export default App;
