import React, { useState } from 'react';
import { Plus, Calendar, Tag, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ProposalFormData } from '@/types';
import { useContract } from '@/contexts/ContractProvider';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  'Governance',
  'Finance',
  'Technical',
  'Community',
  'Marketing',
  'Operations',
  'Other'
];

export function ProposalForm({ isOpen, onClose, onSuccess }: ProposalFormProps) {
  const { createProposal, isLoading } = useContract();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProposalFormData>({
    defaultValues: {
      title: '',
      description: '',
      duration: 24,
      durationUnit: 'hours',
      category: 'Governance'
    }
  });

  const durationUnit = watch('durationUnit');
  const duration = watch('duration');

  const calculateMinutes = (duration: number, unit: string): number => {
    switch (unit) {
      case 'minutes':
        return duration;
      case 'hours':
        return duration * 60;
      case 'days':
        return duration * 60 * 24;
      default:
        return duration * 60;
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    try {
      setIsSubmitting(true);
      const durationInMinutes = calculateMinutes(data.duration, data.durationUnit);
      
      const proposalId = await createProposal(
        data.title,
        data.description,
        durationInMinutes,
        data.category
      );

      if (proposalId) {
        reset();
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Proposal"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Proposal Title
          </label>
          <input
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
              maxLength: { value: 100, message: 'Title must be less than 100 characters' }
            })}
            className="input-field w-full"
            placeholder="Enter a clear, concise title for your proposal"
          />
          {errors.title && (
            <p className="text-danger-400 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Category
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="input-field w-full"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-slate-800">
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-danger-400 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 20, message: 'Description must be at least 20 characters' },
              maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
            })}
            rows={6}
            className="input-field w-full resize-none"
            placeholder="Provide a detailed description of your proposal, including the rationale, expected outcomes, and any relevant information voters should consider..."
          />
          {errors.description && (
            <p className="text-danger-400 text-sm mt-1">{errors.description.message}</p>
          )}
          <p className="text-white/60 text-xs mt-1">
            {watch('description')?.length || 0}/1000 characters
          </p>
        </div>

        {/* Voting Duration */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Voting Duration
          </label>
          <div className="flex gap-3">
            <input
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 1, message: 'Duration must be at least 1' },
                max: { value: durationUnit === 'days' ? 30 : durationUnit === 'hours' ? 720 : 43200, 
                      message: 'Duration too long' }
              })}
              type="number"
              min="1"
              className="input-field flex-1"
              placeholder="Enter duration"
            />
            <select
              {...register('durationUnit')}
              className="input-field w-32"
            >
              <option value="minutes" className="bg-slate-800">Minutes</option>
              <option value="hours" className="bg-slate-800">Hours</option>
              <option value="days" className="bg-slate-800">Days</option>
            </select>
          </div>
          {errors.duration && (
            <p className="text-danger-400 text-sm mt-1">{errors.duration.message}</p>
          )}
          <p className="text-white/60 text-xs mt-1">
            Total duration: {calculateMinutes(duration || 0, durationUnit)} minutes
            {duration && durationUnit === 'days' && ` (${duration} day${duration > 1 ? 's' : ''})`}
            {duration && durationUnit === 'hours' && ` (${duration} hour${duration > 1 ? 's' : ''})`}
          </p>
        </div>

        {/* Preview */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-medium text-white mb-2">Preview:</h4>
          <div className="space-y-2 text-sm">
            <div className="text-white/80">
              <span className="text-white/60">Title:</span> {watch('title') || 'Untitled Proposal'}
            </div>
            <div className="text-white/80">
              <span className="text-white/60">Category:</span> {watch('category')}
            </div>
            <div className="text-white/80">
              <span className="text-white/60">Duration:</span> {duration} {durationUnit}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn-outline disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn-primary disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
