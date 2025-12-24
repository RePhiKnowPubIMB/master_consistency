import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';

const EfficiencyHeatmap = ({ data, title, maxValue = 4, colorClass = 'text-emerald-500', onClick, variant }) => {
    const values = data || [];
    
    // Extract color name from text-color-500
    const colorName = colorClass.split('-')[1] || 'emerald';

    const getColorScale = (name) => {
        const scales = {
            emerald: ['fill-emerald-300', 'fill-emerald-500', 'fill-emerald-700', 'fill-emerald-900'],
            blue: ['fill-blue-300', 'fill-blue-500', 'fill-blue-700', 'fill-blue-900'],
            purple: ['fill-purple-300', 'fill-purple-500', 'fill-purple-700', 'fill-purple-900'],
            yellow: ['fill-yellow-300', 'fill-yellow-500', 'fill-yellow-700', 'fill-yellow-900'],
            pink: ['fill-pink-300', 'fill-pink-500', 'fill-pink-700', 'fill-pink-900'],
            orange: ['fill-orange-300', 'fill-orange-500', 'fill-orange-700', 'fill-orange-900'],
            cyan: ['fill-cyan-300', 'fill-cyan-500', 'fill-cyan-700', 'fill-cyan-900'],
        };
        return scales[name] || scales.emerald;
    };

    const currentScale = getColorScale(colorName);

    const getClassForValue = (value) => {
        if (!value || value.count === 0) return 'fill-slate-700';
        
        if (variant === 'mixed-yellow-green') {
            const max = value.max || maxValue;
            const ratio = value.count / max;
            const segment = Math.ceil(ratio * 6);

            if (segment <= 1) return 'fill-emerald-200';
            if (segment === 2) return 'fill-emerald-300';
            if (segment === 3) return 'fill-emerald-400';
            if (segment === 4) return 'fill-emerald-500';
            if (segment === 5) return 'fill-emerald-600';
            return 'fill-emerald-700';
        }

        const percentage = (value.count / maxValue) * 100;
        
        if (percentage <= 25) return currentScale[0];
        if (percentage <= 50) return currentScale[1];
        if (percentage <= 75) return currentScale[2];
        return currentScale[3];
    };

    // Streak Calculation Logic
    const getMaxStreak = (dataset) => {
        if (!dataset || dataset.length === 0) return 0;
        
        const activeDates = dataset
            .filter(d => d.count > 0)
            .map(d => new Date(d.date).setHours(0,0,0,0))
            .sort((a, b) => a - b);
            
        if (activeDates.length === 0) return 0;

        let max = 1;
        let current = 1;
        const uniqueDates = [...new Set(activeDates)];

        for (let i = 1; i < uniqueDates.length; i++) {
            // Difference in days
            const diff = Math.round((uniqueDates[i] - uniqueDates[i-1]) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                current++;
            } else {
                current = 1;
            }
            if (current > max) max = current;
        }
        return max;
    };

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const lastYearData = values.filter(d => new Date(d.date) >= oneYearAgo);
    const lastMonthData = values.filter(d => new Date(d.date) >= oneMonthAgo);

    const maxStreakAllTime = getMaxStreak(values);
    const maxStreakLastYear = getMaxStreak(lastYearData);
    const maxStreakLastMonth = getMaxStreak(lastMonthData);

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg w-full">
            {title && <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>}
            <div className="w-full">
                <CalendarHeatmap
                    startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
                    endDate={new Date()}
                    values={values}
                    classForValue={getClassForValue}
                    onClick={onClick}
                    tooltipDataAttrs={value => {
                        let dateDisplay = '';
                        if (value.date) {
                            const d = new Date(value.date);
                            // Format as YYYY-MM-DD in local time
                            dateDisplay = d.toLocaleDateString('en-CA'); 
                        }
                        return {
                            'data-tooltip-id': 'heatmap-tooltip',
                            'data-tooltip-content': `${dateDisplay}: ${value.count || 0}`,
                        };
                    }}
                    showWeekdayLabels={true}
                    gutterSize={2}
                />
            </div>
            
            {/* Streak Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 border-t border-slate-700 pt-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{maxStreakAllTime} days</div>
                    <div className="text-xs text-slate-400">in a row max.</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{maxStreakLastYear} days</div>
                    <div className="text-xs text-slate-400">in a row for the last year</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{maxStreakLastMonth} days</div>
                    <div className="text-xs text-slate-400">in a row for the last month</div>
                </div>
            </div>

            <Tooltip id="heatmap-tooltip" />
            <style>{`
                .react-calendar-heatmap text { fill: #94a3b8; font-size: 10px; }
                .react-calendar-heatmap rect { rx: 2px; } /* Rounded corners for cells */
                .react-calendar-heatmap rect:hover { stroke: #fff; stroke-width: 1px; }
            `}</style>
        </div>
    );
};

export default EfficiencyHeatmap;
