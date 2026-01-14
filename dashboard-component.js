const { useState, useMemo } = React;
const { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

const Dashboard = () => {
    const [selectedWeek, setSelectedWeek] = useState('2026-01-05');
    const [sortBy, setSortBy] = useState('total_hours');
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedServiceLine, setSelectedServiceLine] = useState(null);

    const availableWeeks = DASHBOARD_DATA.available_weeks;
    const currentWeekIndex = availableWeeks.indexOf(selectedWeek);
    const previousWeek = currentWeekIndex > 0 ? availableWeeks[currentWeekIndex - 1] : null;

    const currentWeekData = DASHBOARD_DATA.weekly_summary[selectedWeek] || {};
    const previousWeekData = previousWeek ? DASHBOARD_DATA.weekly_summary[previousWeek] : null;

    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return null;
        return Math.round(((current - previous) / previous) * 100);
    };

    const changes = previousWeekData ? {
        hours: calculateChange(currentWeekData.total_hours, previousWeekData.total_hours),
        tasks: calculateChange(currentWeekData.total_tasks, previousWeekData.total_tasks),
        revenue: calculateChange(currentWeekData.total_revenue, previousWeekData.total_revenue),
        providers: calculateChange(currentWeekData.active_providers, previousWeekData.active_providers)
    } : { hours: null, tasks: null, revenue: null, providers: null };

    const employeeData = useMemo(() => {
        const weekData = DASHBOARD_DATA.weekly_employees[selectedWeek] || {};
        return Object.entries(weekData)
            .map(([id, data]) => ({
                id: `Doctor ${id}`,
                emp_id: id,
                total_hours: data.total_time,
                total_tasks: data.tasks_completed,
                shifts: data.timesheet_id,
                tasks_per_hour: data.tasks_per_hour,
                avg_shift_length: data.avg_shift_length
            }))
            .sort((a, b) => b[sortBy] - a[sortBy]);
    }, [selectedWeek, sortBy]);

    const unitData = useMemo(() => {
        const weekData = DASHBOARD_DATA.weekly_units[selectedWeek] || {};
        return Object.entries(weekData)
            .map(([name, data]) => ({
                name,
                hours: data.total_time,
                tasks: data.tasks_completed,
                efficiency: (data.tasks_completed / data.total_time).toFixed(1)
            }))
            .sort((a, b) => b.hours - a.hours);
    }, [selectedWeek]);

    const allWeeksTrend = useMemo(() => {
        return availableWeeks.map(week => {
            const weekData = DASHBOARD_DATA.weekly_summary[week] || {};
            return {
                week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                hours: weekData.total_hours || 0,
                tasks: weekData.total_tasks || 0
            };
        });
    }, []);

    const providerTrendData = useMemo(() => {
        if (!selectedProvider) return [];
        const trends = DASHBOARD_DATA.employee_trends[selectedProvider] || [];
        return trends.map(t => ({
            week: new Date(t.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            hours: t.hours,
            tasks: t.tasks
        }));
    }, [selectedProvider]);

    const serviceLineTrendData = useMemo(() => {
        if (!selectedServiceLine) return [];
        const trends = DASHBOARD_DATA.unit_trends[selectedServiceLine] || [];
        return trends.map(t => ({
            week: new Date(t.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            hours: t.hours,
            tasks: t.tasks
        }));
    }, [selectedServiceLine]);

    const MetricCard = ({ title, value, subtitle, trend, icon }) => {
        const showTrend = trend !== null && Math.abs(trend) > 0 && Math.abs(trend) < 200;
        return (
            <div style={{
                background: 'white',
                padding: '1.75rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: '1rem',
                position: 'relative'
            }}>
                <div style={{
                    fontSize: '2rem',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f0fdf9, #e0f7f3)',
                    borderRadius: '12px'
                }}>{icon}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#718096', fontWeight: 500, marginBottom: '0.5rem' }}>{title}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a202c', marginBottom: '0.5rem' }}>{value}</div>
                    <div style={{ fontSize: '0.813rem', color: '#a0aec0' }}>{subtitle}</div>
                </div>
                {showTrend && (
                    <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: trend > 0 ? '#d4f4e8' : '#fee',
                        color: trend > 0 ? '#00a389' : '#e53e3e'
                    }}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)', color: '#2d3748' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #00c9a7 0%, #00a389 100%)', color: 'white', padding: '2rem 3rem' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
                        <span>⚕️ Asterix Health</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Weekly Operations Dashboard</div>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 3rem' }}>
                {/* Week Selector */}
                <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                        <span style={{ fontSize: '1.5rem' }}>📅</span>
                        <span>Select Week</span>
                    </div>
                    <select 
                        value={selectedWeek} 
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        style={{ flex: 1, padding: '0.875rem 1.25rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer' }}
                    >
                        {availableWeeks.map(week => (
                            <option key={week} value={week}>
                                Week of {new Date(week).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            onClick={() => currentWeekIndex > 0 && setSelectedWeek(availableWeeks[currentWeekIndex - 1])}
                            disabled={currentWeekIndex === 0}
                            style={{ padding: '0.875rem 1.5rem', border: '2px solid #e2e8f0', background: 'white', borderRadius: '10px', fontWeight: 600, cursor: currentWeekIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentWeekIndex === 0 ? 0.4 : 1 }}
                        >
                            ← Previous
                        </button>
                        <button 
                            onClick={() => currentWeekIndex < availableWeeks.length - 1 && setSelectedWeek(availableWeeks[currentWeekIndex + 1])}
                            disabled={currentWeekIndex === availableWeeks.length - 1}
                            style={{ padding: '0.875rem 1.5rem', border: '2px solid #e2e8f0', background: 'white', borderRadius: '10px', fontWeight: 600, cursor: currentWeekIndex === availableWeeks.length - 1 ? 'not-allowed' : 'pointer', opacity: currentWeekIndex === availableWeeks.length - 1 ? 0.4 : 1 }}
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <MetricCard
                        icon="⏱"
                        title="Total Hours"
                        value={currentWeekData.total_hours?.toFixed(1) || '0'}
                        subtitle={`Across ${currentWeekData.total_shifts || 0} shifts`}
                        trend={changes.hours}
                    />
                    <MetricCard
                        icon="✓"
                        title="Tasks Completed"
                        value={currentWeekData.total_tasks?.toLocaleString() || '0'}
                        subtitle={`${currentWeekData.avg_tasks_per_hour?.toFixed(1) || '0'} tasks/hour avg`}
                        trend={changes.tasks}
                    />
                    <MetricCard
                        icon="$"
                        title="Revenue Generated"
                        value={`$${((currentWeekData.total_revenue || 0) / 1000).toFixed(1)}k`}
                        subtitle="Billable hours processed"
                        trend={changes.revenue}
                    />
                    <MetricCard
                        icon="👥"
                        title="Active Providers"
                        value={currentWeekData.active_providers || 0}
                        subtitle={`Week of ${new Date(selectedWeek).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        trend={changes.providers}
                    />
                </div>

                {/* Overall Trends */}
                <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Overall Performance Trends (June - January)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={allWeeksTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="week" stroke="#666" style={{ fontSize: '12px' }} />
                            <YAxis yAxisId="left" stroke="#666" style={{ fontSize: '12px' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#666" style={{ fontSize: '12px' }} />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#00c9a7" strokeWidth={3} name="Total Hours" />
                            <Line yAxisId="right" type="monotone" dataKey="tasks" stroke="#ff6b9d" strokeWidth={3} name="Total Tasks" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Provider Leaderboard */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            Provider Performance - {new Date(selectedWeek).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#f7fafc', padding: '0.375rem', borderRadius: '10px' }}>
                            {['total_hours', 'total_tasks', 'tasks_per_hour'].map(sort => (
                                <button
                                    key={sort}
                                    onClick={() => setSortBy(sort)}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        border: 'none',
                                        background: sortBy === sort ? 'linear-gradient(135deg, #00c9a7, #00a389)' : 'transparent',
                                        color: sortBy === sort ? 'white' : '#4a5568',
                                        fontWeight: 500,
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {sort === 'total_hours' ? 'Hours' : sort === 'total_tasks' ? 'Tasks' : 'Efficiency'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {employeeData.map((emp, idx) => (
                            <div
                                key={emp.id}
                                onClick={() => setSelectedProvider(selectedProvider === emp.emp_id ? null : emp.emp_id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    padding: '1.5rem',
                                    background: selectedProvider === emp.emp_id ? '#e6f9f5' : '#fafbfc',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: `2px solid ${selectedProvider === emp.emp_id ? '#00c9a7' : 'transparent'}`
                                }}
                            >
                                <div style={{ width: '48px', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        background: idx < 3 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : '#e2e8f0',
                                        color: idx < 3 ? '#744210' : '#4a5568',
                                        fontWeight: 700
                                    }}>
                                        {idx + 1}
                                    </span>
                                </div>
                                <div style={{ minWidth: '180px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.063rem', marginBottom: '0.25rem' }}>{emp.id}</div>
                                    <div style={{ fontSize: '0.813rem', color: '#718096' }}>{emp.shifts} shifts · {emp.avg_shift_length}h avg</div>
                                </div>
                                <div style={{ display: 'flex', gap: '2.5rem', marginLeft: 'auto' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                                            {emp.total_hours.toFixed(0)}h
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>Hours</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                                            {emp.total_tasks}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>Tasks</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: '#00c9a7' }}>
                                            {emp.tasks_per_hour}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>Tasks/hr</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#00c9a7', marginLeft: '2rem' }}>
                                    {selectedProvider === emp.emp_id ? 'Hide' : 'View'} Trend →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Provider Trend */}
                {selectedProvider && providerTrendData.length > 0 && (
                    <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                                Doctor {selectedProvider} - Week over Week Performance
                            </h3>
                            <button
                                onClick={() => setSelectedProvider(null)}
                                style={{ padding: '0.5rem 1rem', border: '2px solid #e2e8f0', background: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={providerTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="week" stroke="#666" style={{ fontSize: '12px' }} />
                                <YAxis yAxisId="left" stroke="#666" style={{ fontSize: '12px' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#666" style={{ fontSize: '12px' }} />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#00c9a7" strokeWidth={3} name="Hours" />
                                <Line yAxisId="right" type="monotone" dataKey="tasks" stroke="#ff6b9d" strokeWidth={3} name="Tasks" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Service Lines */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Service Line Performance - {new Date(selectedWeek).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                        {unitData.map(unit => (
                            <div
                                key={unit.name}
                                onClick={() => setSelectedServiceLine(selectedServiceLine === unit.name ? null : unit.name)}
                                style={{
                                    background: selectedServiceLine === unit.name ? '#e6f9f5' : '#f7fafc',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    border: `2px solid ${selectedServiceLine === unit.name ? '#00c9a7' : '#e2e8f0'}`,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>{unit.name}</div>
                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                                            {unit.hours.toFixed(0)}h
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>Total Hours</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                                            {unit.tasks}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>Tasks</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: '#00c9a7' }}>
                                            {unit.efficiency}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>Tasks/hr</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.813rem', fontWeight: 600, color: '#00c9a7' }}>
                                    {selectedServiceLine === unit.name ? 'Hide' : 'View'} Trend
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Service Line Trend */}
                {selectedServiceLine && serviceLineTrendData.length > 0 && (
                    <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                                {selectedServiceLine} - Week over Week Performance
                            </h3>
                            <button
                                onClick={() => setSelectedServiceLine(null)}
                                style={{ padding: '0.5rem 1rem', border: '2px solid #e2e8f0', background: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={serviceLineTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="week" stroke="#666" style={{ fontSize: '12px' }} />
                                <YAxis yAxisId="left" stroke="#666" style={{ fontSize: '12px' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#666" style={{ fontSize: '12px' }} />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#00c9a7" strokeWidth={3} name="Hours" />
                                <Line yAxisId="right" type="monotone" dataKey="tasks" stroke="#ff6b9d" strokeWidth={3} name="Tasks" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

ReactDOM.render(<Dashboard />, document.getElementById('root'));
