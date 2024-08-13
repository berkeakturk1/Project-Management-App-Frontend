import React, { useState, useEffect } from "react";
import {
    Checkbox,
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
import "./MyTasks.css";
import { tableCellClasses } from "@mui/material/TableCell";

interface Task {
    id: number;
    task_title: string;
    taskboard: string;
    status: string;
    dueDate: string;
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

            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, []);

    const handleFlagForReview = async (taskId: number) => {
        try {
            const response = await fetch(`/api/flag-task/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ flagForReview: true }),
            });

            if (!response.ok) {
                throw new Error("Failed to flag task for review");
            }

            // Update task in state
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, flaggedForReview: true } : task
                )
            );
        } catch (error) {
            console.error("Error flagging task for review:", error);
        }
    };

    return (
        <Paper elevation={3} sx={{ padding: 2, maxWidth: '100%' }}>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold'}}>
                Assigned to Me
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
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
                                            {task.dueDate}{task.dueTime && `, ${task.dueTime}`}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Tooltip title="Flag for Review">
                                                <IconButton onClick={() => handleFlagForReview(task.id)}>
                                                    {task.flaggedForReview ? (
                                                        <FlagIcon sx={{ color: '#f44336' }} />
                                                    ) : (
                                                        <FlagOutlinedIcon sx={{ color: '#4caf50' }} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default MyTasks;
