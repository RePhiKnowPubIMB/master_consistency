import React from 'react';
import { Award, Moon, Dumbbell, Terminal, BookOpen, Brain, Crown } from 'lucide-react';

const BadgeList = ({ badges }) => {
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Moon': return <Moon size={20} />;
            case 'Dumbbell': return <Dumbbell size={20} />;
            case 'Terminal': return <Terminal size={20} />;
            case 'BookOpen': return <BookOpen size={20} />;
            case 'Brain': return <Brain size={20} />;
            case 'Crown': return <Crown size={20} />;
            default: return <Award size={20} />;
        }
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 'Bronze': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
            case 'Silver': return 'text-slate-300 border-slate-300/30 bg-slate-300/10';
            case 'Gold': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'Platinum': return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
            case 'Diamond': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
            default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
        }
    };

    if (!badges || badges.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 italic">
                No badges earned yet. Stay consistent to unlock them!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, idx) => (
                <div key={idx} className={`flex flex-col items-center p-4 rounded-xl border ${getTierColor(badge.tier)} transition-transform hover:scale-105`}>
                    <div className="mb-2 p-3 rounded-full bg-slate-900/50 shadow-inner">
                        {getIcon(badge.icon)}
                    </div>
                    <h3 className="font-bold text-sm text-center mb-1">{badge.name}</h3>
                    <span className="text-xs uppercase tracking-wider opacity-75 mb-2">{badge.tier}</span>
                    <p className="text-xs text-center opacity-60">{badge.description}</p>
                </div>
            ))}
        </div>
    );
};

export default BadgeList;
