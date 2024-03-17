import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import { Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';

const Appbar = (params) => {
    const { username, photoURL, onLogout, toggleChatWindow } = params;
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogoutClick = () => {
        // Call the parent callback function to handle logout
        onLogout();
        // Close the user menu
        handleCloseUserMenu();
    };

    return (
        <div>
            <AppBar>
                <Toolbar>
                    <Typography style={{ flexGrow: 0.5, textAlign: 'left' }}>3D Map Game</Typography>
                    <div className='options' style={{ flexGrow: 0.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Typography>{username}</Typography>
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt={username} src={photoURL} style={{ marginLeft: '10px' }} />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem key="Chat" onClick={toggleChatWindow}>
                                    <Typography textAlign="center">Chat</Typography>
                                </MenuItem>
                                <MenuItem key="Logout" onClick={handleLogoutClick}>
                                    <Typography textAlign="center">Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </div>
                </Toolbar>

            </AppBar>
        </div>
    );
};

export default Appbar;
