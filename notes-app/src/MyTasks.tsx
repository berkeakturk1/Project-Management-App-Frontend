import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Tooltip,
    Grid,
    IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { Flag as FlagIcon, FlagOutlined as FlagOutlinedIcon } from "@mui/icons-material";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import "./MyTasks.css";
import { tableCellClasses } from "@mui/material/TableCell";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Task {
    id: number;
    task_title: string;
    taskboard: string;
    status: string;
    dueDate?: string;
    dueTime?: string;
    isLate: boolean;
    flaggedForReview: boolean;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.grey[100],
        color: theme.palette.text.primary,
        fontWeight: 'bold',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
        backgroundColor: theme.palette.action.selected,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const MyTasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<number>(0);

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("User is not logged in.");
                return;
            }

            try {
                const response = await fetch('/api/user-tasks', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
                }

                const data = await response.json();
                setTasks(data);

                // Calculate completed tasks
                const completed = data.filter((task: Task) => task.status === "Done" || task.status === "Complete").length;
                setCompletedTasks(completed);

            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();

        // Polling interval
        const interval = setInterval(() => {
            fetchTasks();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    const handleFlagForReview = async (taskId: number) => {
        try {
            const response = await fetch(`/api/flag-task/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: "codeReview" }), // Send the new status to the backend
            });

            if (!response.ok) {
                throw new Error("Failed to flag task for review");
            }

            // Update task in state
            setTasks(prevTasks =>
                prevTasks.map(task => {
                    console.log(`Task ID: ${task.id}, Status: ${task.status}`);  // Debugging line
                    return task.id === taskId ? { ...task, status: "codeReview", flaggedForReview: true } : task;
                })
            );
        } catch (error) {
            console.error("Error flagging task for review:", error);
        }
    };

    const formatDateTime = (dueDate?: string, dueTime?: string) => {
        if (!dueDate) {
            return "No date attached";
        }

        const formattedDate = new Date(dueDate).toLocaleDateString();
        const formattedTime = dueTime ? new Date(`1970-01-01T${dueTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return `${formattedDate}${formattedTime ? `, ${formattedTime}` : ''}`;
    };

    const totalTasks = tasks.length;
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <Paper elevation={3} sx={{ padding: 2, maxWidth: '100%' }}>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold'}}>
                Assigned to Me
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="left">Tasks</StyledTableCell>
                                    <StyledTableCell align="center">Taskboard</StyledTableCell>
                                    <StyledTableCell align="center">Status</StyledTableCell>
                                    <StyledTableCell align="center">Due Date</StyledTableCell>
                                    <StyledTableCell align="center">Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.map((task, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell component="th" scope="row">
                                            {task.task_title}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">{task.taskboard}</StyledTableCell>
                                        <StyledTableCell align="center">{task.status}</StyledTableCell>
                                        <StyledTableCell align="center" sx={{ color: task.isLate ? 'red' : 'inherit', fontWeight: task.isLate ? 'bold' : 'normal' }}>
                                            {formatDateTime(task.dueDate, task.dueTime)}

                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Tooltip title={task.status === "done" ? "Task Completed" : "Flag for Review"}>
                                                <span>
                                                    <IconButton
                                                        onClick={task.status !== "done" ? () => handleFlagForReview(task.id) : undefined}
                                                        disabled={task.status === "done"} // Disable the button if the task is done
                                                        sx={{ color: task.status === "done" ? '#4caf50' : 'inherit' }}
                                                    >
                                                        {task.status === "done" ? (
                                                            <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                                        ) : (
                                                            task.status === "codeReview" || task.flaggedForReview ? (
                                                                <FlagIcon sx={{ color: '#4caf50' }} />
                                                            ) : (
                                                                <FlagOutlinedIcon sx={{ color: '#4caf50' }} />
                                                            )
                                                        )}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: 200, height: 200 }}>
                        <CircularProgressbar
                            value={percentage}
                            text={`${Math.round(percentage)}%`}
                            styles={buildStyles({
                                pathColor: `rgba(60, 179, 113, ${percentage / 100})`,
                                textColor: '#000',
                                trailColor: '#d6d6d6',
                                backgroundColor: '#3e98c7',
                                strokeLinecap: 'butt', // stroke line ending style (can be 'butt' or 'round')
                                textSize: '16px', // text size
                                pathTransitionDuration: 0.5, // animation duration
                                pathTransition: 'ease',
                            })}
                        />
                    </div>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default MyTasks;
