import React from 'react';
import { AlertTriangle, RotateCcw, Shield } from 'lucide-react';

/**
 * ErrorBoundary oficial para Karate Brackets Pro
 * Evita que un error imprevisto en alguna gráfica o dato deje la pantalla en blanco.
 * Muestra una tarjeta de recuperación limpia y permite reintentar sin perder datos.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó una excepción en render:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Se detectó una discrepancia en los datos
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                El sistema aisló un error al renderizar la vista de competencia. Tus datos en Firebase y en el padrón están a salvo.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 p-3 rounded-lg text-left text-[11px] font-mono text-rose-300 border border-slate-800 overflow-x-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recargar y Restaurar Panel</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
