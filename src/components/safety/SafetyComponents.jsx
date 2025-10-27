import React, { useState } from 'react';
import { Icon, icons } from '../../lib/icons';

/**
 * Safety & Moderation Components
 * Report modal, blocking, content filtering, and strike system
 */

// ============= Report Modal =============

export const ReportModal = ({ targetUser, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    { value: 'Harassment', icon: icons.warning, color: 'text-red-500' },
    { value: 'Inappropriate Content', icon: icons.close, color: 'text-orange-500' },
    { value: 'Suspected Grooming', icon: icons.shield, color: 'text-purple-500' },
    { value: 'Fake Profile', icon: icons.user, color: 'text-yellow-500' },
    { value: 'Spam', icon: icons.envelope, color: 'text-gray-500' },
    { value: 'Underage User', icon: icons.users, color: 'text-pink-500' },
    { value: 'Other', icon: icons.info, color: 'text-blue-500' },
  ];

  const handleSubmit = async () => {
    if (!reason) return;
    
    setIsSubmitting(true);
    
    const report = {
      id: `report_${Date.now()}`,
      reporterId: 'current_user_id', // Would get from auth context
      targetId: targetUser.id,
      reason,
      description,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(report);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Report User</h2>
            <button onClick={onClose}>
              <Icon icon={icons.close} className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Reporting {targetUser.displayName}. All reports are reviewed by our trust & safety team.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Reason for Report *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {reportReasons.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    reason === r.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-transparent'
                  }`}
                  style={reason !== r.value ? { background: 'var(--color-bg)', border: '1px solid var(--color-border)' } : {}}
                >
                  <Icon icon={r.icon} className={`w-5 h-5 mb-1 ${r.color}`} />
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{r.value}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help our review..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg resize-none"
              style={{ 
                background: 'var(--color-bg)', 
                color: 'var(--color-text)', 
                border: '1px solid var(--color-border)' 
              }}
            />
          </div>

          {/* Safety Notice */}
          {reason === 'Suspected Grooming' && (
            <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500">
              <div className="flex gap-3">
                <Icon icon={icons.shield} className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    High Priority Report
                  </p>
                  <p className="text-xs text-purple-800 dark:text-purple-200">
                    This report will be escalated immediately to our safety team for urgent review. 
                    If you or someone you know is in immediate danger, please contact local authorities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= Block Confirmation Modal =============

export const BlockModal = ({ targetUser, onClose, onConfirm }) => {
  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlock = async () => {
    setIsBlocking(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Icon icon={icons.close} className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Block {targetUser.displayName}?
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            They won't be able to see your profile, send you messages, or match with you.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isBlocking}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleBlock}
            disabled={isBlocking}
            className="flex-1 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {isBlocking ? 'Blocking...' : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= Content Filter Utilities =============

export const ContentFilter = {
  // Profanity filter (simplified - would use a comprehensive library in production)
  filterProfanity: (text) => {
    const profanityList = ['badword1', 'badword2', 'badword3']; // Placeholder
    let filtered = text;
    profanityList.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
  },

  // Detect forbidden phrases (grooming, inappropriate requests)
  containsForbiddenPhrase: (text) => {
    const forbiddenPatterns = [
      /meet me alone/i,
      /don't tell (your )?(parents|mom|dad)/i,
      /send (me )?(pics|pictures|photos)/i,
      /what are you wearing/i,
      // Add more patterns based on safety research
    ];
    return forbiddenPatterns.some(pattern => pattern.test(text));
  },

  // Check if content is appropriate for minors
  isMinorSafe: (text) => {
    const adultContentPatterns = [
      /\b(sex|sexual|explicit)\b/i,
      /\b(drink|alcohol|drugs)\b/i,
      // Add more patterns
    ];
    return !adultContentPatterns.some(pattern => pattern.test(text));
  },

  // Comprehensive message validation
  validateMessage: (message, sender, recipient) => {
    const result = {
      isValid: true,
      filtered: message.content,
      flags: [],
      shouldBlock: false,
    };

    // Filter profanity
    result.filtered = ContentFilter.filterProfanity(message.content);

    // Check for forbidden phrases
    if (ContentFilter.containsForbiddenPhrase(message.content)) {
      result.flags.push('suspected_grooming');
      result.shouldBlock = recipient.isMinor || sender.isMinor;
    }

    // Minor safety check
    if ((recipient.isMinor || sender.isMinor) && !ContentFilter.isMinorSafe(message.content)) {
      result.flags.push('inappropriate_for_minors');
      result.shouldBlock = true;
    }

    // Prevent adults messaging minors (failsafe)
    if (sender.isMinor !== recipient.isMinor) {
      result.isValid = false;
      result.shouldBlock = true;
      result.flags.push('age_mismatch');
    }

    return result;
  },
};

// ============= Safety Banner Component =============

export const SafetyBanner = ({ userType }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tips = {
    minor: [
      'Never share personal information like your address, phone number, or school name',
      'Always tell your parent/guardian before meeting anyone in person',
      'Meet only at public gyms or training centers with adults present',
      'Report anyone who makes you uncomfortable',
      'Your chats are monitored for safety by the system and your parent can view them',
    ],
    adult: [
      'Meet new partners at public gyms or training centers',
      'Let a friend or family member know when and where you\'re meeting',
      'Verify the person\'s credentials and training background',
      'Report suspicious behavior immediately',
      'Trust your instincts - if something feels off, it probably is',
    ],
  };

  const currentTips = tips[userType] || tips.adult;

  return (
    <div className="mb-6 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Icon icon={icons.shield} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Safety Tips</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {isExpanded ? 'Hide' : 'Show'} important safety guidelines
            </p>
          </div>
        </div>
        <Icon 
          icon={isExpanded ? icons.chevronUp : icons.chevronDown} 
          className="w-5 h-5" 
          style={{ color: 'var(--color-text-muted)' }} 
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {currentTips.map((tip, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--color-bg)' }}>
              <Icon icon={icons.check} className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: 'var(--color-text)' }}>{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============= Strike System Display =============

export const StrikeIndicator = ({ strikes, maxStrikes = 3 }) => {
  if (strikes === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
      <Icon icon={icons.warning} className="w-4 h-4 text-red-600 dark:text-red-400" />
      <span className="text-xs font-semibold text-red-700 dark:text-red-300">
        {strikes}/{maxStrikes} Strikes
      </span>
    </div>
  );
};

// ============= Moderation Status Indicator =============

export const ModerationBadge = ({ status }) => {
  const statusConfig = {
    pending: { icon: icons.clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'Under Review' },
    approved: { icon: icons.check, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Approved' },
    blocked: { icon: icons.close, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'Blocked' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${config.bg}`}>
      <Icon icon={config.icon} className={`w-3 h-3 ${config.color}`} />
      <span className={`text-xs font-semibold ${config.color}`}>{config.text}</span>
    </div>
  );
};

export default {
  ReportModal,
  BlockModal,
  ContentFilter,
  SafetyBanner,
  StrikeIndicator,
  ModerationBadge,
};
