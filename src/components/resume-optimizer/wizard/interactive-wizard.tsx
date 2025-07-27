import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WIZARD_STEPS } from './wizard-steps';

const InteractiveWizard = () => {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const firstTimeUser = localStorage.getItem('hasViewedResumeOptimizerWizard');
    if (!firstTimeUser) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasViewedResumeOptimizerWizard', 'true');
  };

  if (!isOpen) {
    return null;
  }

  const currentStep = WIZARD_STEPS[step];

  if (!currentStep) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/30 bg-white/80 text-black shadow-2xl backdrop-blur-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-2xl text-purple-600">{currentStep.title}</h2>
                <p className="mt-1 text-gray-600 text-sm">
                  Step {step + 1} of {WIZARD_STEPS.length}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-600 transition-colors hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="prose mb-6 max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: currentStep.content }}
            />

            {currentStep.command && (
              <div
                className="my-4 rounded-lg border border-white/40 p-4 font-mono text-green-700 text-sm"
                style={{
                  background: 'rgba(240, 253, 244, 0.8)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <p className="flex items-center">
                  <span className="mr-2 text-blue-600">PS C:\Users\USER&gt;</span>
                  {currentStep.command}
                </p>
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between border-white/30 border-t px-6 py-4"
            style={{
              background: 'rgba(248, 250, 252, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <div className="text-gray-500 text-xs">SwipeHire Interactive Wizard</div>
            <div className="flex items-center gap-4">
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:text-black"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm text-white transition-all duration-200"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(168, 85, 247, 0.9))',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(147, 51, 234, 1), rgba(168, 85, 247, 1))';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(168, 85, 247, 0.9))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {step === WIZARD_STEPS.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InteractiveWizard;
