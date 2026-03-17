import { useState } from 'react';
import { Calculator, Target, TrendingUp } from 'lucide-react';
import { UGC_GRADES } from '../types';

export default function GradeCalculator() {
  const [midterm, setMidterm] = useState('');
  const [assignment, setAssignment] = useState('');
  const [attendancePct, setAttendancePct] = useState('');
  const [targetGpa, setTargetGpa] = useState('3.50');

  // Typical BD university weight distribution: Mid 30%, Assignment 10%, Attendance 10%, Final 50%
  const midWeight = 30;
  const assignWeight = 10;
  const attendWeight = 10;
  const finalWeight = 50;

  const midVal = parseFloat(midterm) || 0;
  const assignVal = parseFloat(assignment) || 0;
  const attendVal = parseFloat(attendancePct) || 0;

  // Current earned marks (out of 100)
  const earnedFromMid = (midVal / 100) * midWeight;
  const earnedFromAssign = (assignVal / 100) * assignWeight;
  const earnedFromAttend = (attendVal / 100) * attendWeight;
  const totalEarned = earnedFromMid + earnedFromAssign + earnedFromAttend;

  // Find target grade
  const targetGpaVal = parseFloat(targetGpa);
  const targetGrade = UGC_GRADES.find((g) => g.gpa === targetGpaVal) ?? UGC_GRADES[0];
  const requiredTotal = targetGrade.minMark;
  const requiredFinal = Math.max(0, requiredTotal - totalEarned);
  const requiredFinalPct = Math.min(100, Math.round((requiredFinal / finalWeight) * 100));
  const isAchievable = requiredFinalPct <= 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">UGC Grade Calculator</h1>
          <p className="text-xs text-surface-500">BD Uniform Grading System</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-sm text-surface-300">Enter Your Marks</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-surface-500 mb-1">Mid-term (out of 100)</label>
            <input type="number" value={midterm} onChange={(e) => setMidterm(e.target.value)} placeholder="e.g. 75" max={100} min={0}
              className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-surface-500 mb-1">Assignment (out of 100)</label>
            <input type="number" value={assignment} onChange={(e) => setAssignment(e.target.value)} placeholder="e.g. 85" max={100} min={0}
              className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-surface-500 mb-1">Attendance (%)</label>
            <input type="number" value={attendancePct} onChange={(e) => setAttendancePct(e.target.value)} placeholder="e.g. 90" max={100} min={0}
              className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-surface-500 mb-1">Target GPA</label>
          <select value={targetGpa} onChange={(e) => setTargetGpa(e.target.value)}
            className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none">
            {UGC_GRADES.filter((g) => g.gpa > 0).map((g) => (
              <option key={g.grade} value={g.gpa}>{g.grade} ({g.gpa.toFixed(2)}) — minimum {g.minMark}%</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-primary-400">
          <Target className="w-5 h-5" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Result</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-surface-500 mb-1">Marks Earned So Far</p>
            <p className="text-2xl font-bold gradient-text">{totalEarned.toFixed(1)}</p>
            <p className="text-[10px] text-surface-500">out of {midWeight + assignWeight + attendWeight}</p>
          </div>
          <div className="bg-surface-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-surface-500 mb-1">Target: {targetGrade.grade} ({targetGrade.gpa})</p>
            <p className={`text-2xl font-bold ${isAchievable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {requiredFinalPct}%
            </p>
            <p className="text-[10px] text-surface-500">needed on final exam</p>
          </div>
        </div>

        {!isAchievable && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-rose-400">⚠️ Target {targetGrade.grade} is not achievable with current marks. Try a lower target.</p>
          </div>
        )}

        {isAchievable && midterm && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-emerald-400">✅ You need at least <strong>{requiredFinalPct}%</strong> on the final exam to achieve <strong>{targetGrade.grade}</strong></p>
          </div>
        )}
      </div>

      {/* Grade Table */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 text-surface-400 mb-3">
          <TrendingUp className="w-4 h-4" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">UGC Grading Scale</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-surface-500 text-xs uppercase">
                <th className="text-left pb-2">Grade</th>
                <th className="text-center pb-2">GPA</th>
                <th className="text-center pb-2">Min Marks</th>
                <th className="text-right pb-2">Final Needed</th>
              </tr>
            </thead>
            <tbody>
              {UGC_GRADES.map((g) => {
                const needed = Math.max(0, g.minMark - totalEarned);
                const neededPct = Math.min(100, Math.round((needed / finalWeight) * 100));
                const achievable = neededPct <= 100;
                return (
                  <tr key={g.grade} className={`border-t border-surface-800/50 ${g.gpa === targetGpaVal ? 'bg-primary-600/10' : ''}`}>
                    <td className="py-2 font-medium">{g.grade}</td>
                    <td className="text-center py-2 text-surface-400">{g.gpa.toFixed(2)}</td>
                    <td className="text-center py-2 text-surface-400">{g.minMark}%</td>
                    <td className={`text-right py-2 font-medium ${achievable ? 'text-surface-300' : 'text-rose-500'}`}>
                      {achievable ? `${neededPct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
