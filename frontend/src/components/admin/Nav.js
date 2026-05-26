import React from "react";

import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            <ul>
                <li><link to="/">Home</link></li>
                <li><link to="/">Pemasukan</link></li>
                <li><link to="/">Pengeluaran</link></li>
            </ul>
        </nav>
    );
};

export default Navbar;