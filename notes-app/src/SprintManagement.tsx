import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Avatar, Grid, LinearProgress
} from '@mui/material';
import { styled } from '@mui/system';

interface Task {
    id: number;
    task_title: string;
    taskboard: string;
    status: string;
    importance: string;
    dueDate?: string;
    dueTime?: string;
    isLate: boolean;
    flaggedForReview: boolean;
}

// Define props for StatusChip
interface StatusChipProps {
    status: string;
}

// Define props for PriorityChip
interface PriorityChipProps {
    priority: string;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const StatusChip = styled('div')<StatusChipProps>(({ status }) => ({
    padding: '6px 12px',
    borderRadius: '12px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: status === 'Done' ? '#4caf50' : status === 'Working on it' ? '#ff9800' : '#f44336',
}));

const PriorityChip = styled('div')<PriorityChipProps>(({ priority }) => ({
    padding: '6px 12px',
    borderRadius: '12px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: priority === 'High' ? '#d32f2f' : priority === 'Medium' ? '#f57c00' : '#1976d2',
}));

const SprintManagement = () => {
    const tasks = [
        {
            title: 'Define Jira import needs',
            owner: ['/static/images/avatar/1.jpg'], // Replace with actual image URLs or paths
            status: 'Done',
            priority: 'High',
            timeline: 100,
            date: 'Oct 05',
        },
        {
            title: 'Figure out how to run usability on "alpha" feature',
            owner: ['/static/images/avatar/2.jpg'], // Replace with actual image URLs or paths
            status: 'Working on it',
            priority: 'Medium',
            timeline: 60,
            date: 'Oct 02',
        },
        {
            title: 'Launch complex solution - agile',
            owner: ['/static/images/avatar/3.jpg', '/static/images/avatar/4.jpg'], // Replace with actual image URLs or paths
            status: 'Working on it',
            priority: 'Low',
            timeline: 40,
            date: 'Sep 28',
        },
    ];

    return (
        <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                Sprint 139
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Task</StyledTableCell>
                            <StyledTableCell>Assignee's</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Importance</StyledTableCell>
                            <StyledTableCell>Timeline</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task, index) => (
                            <StyledTableRow key={index}>
                                <StyledTableCell>{task.title}</StyledTableCell>
                                <StyledTableCell>
                                    <Grid container spacing={1}>
                                        {task.owner.map((avatar, idx) => (
                                            <Grid item key={idx}>
                                                <Avatar alt="Owner" src={avatar} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <StatusChip status={task.status}>{task.status}</StatusChip>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <PriorityChip priority={task.priority}>{task.priority}</PriorityChip>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <LinearProgress variant="determinate" value={task.timeline} sx={{ height: '10px', borderRadius: '5px' }} />
                                </StyledTableCell>
                                <StyledTableCell>{task.date}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default SprintManagement;
