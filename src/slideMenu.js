import React from 'react'

import { slide as Menu } from 'react-burger-menu'
import './slideMenu.css';

class SlideMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        };

    }

    componentDidMount() {};

    componentWillUnmount() {};

    render() {

        var menuStyles = {
            bmBurgerButton: {
				position: 'fixed',
				width: '36px',
				height: '30px',
				left: '26px',
				top: '26px'
			},
            bmBurgerBars: {
              	background: '#373a47'
            },
            bmCrossButton: {
				height: '24px',
				width: '24px'
            },
            bmCross: {
	              background: '#bdc3c7'
            },
            bmMenu: {
				//background: '#373a47',
				background: 'rgba(27, 59, 9, .7)',
				padding: '3.5em 0.5em 0',
				fontSize: '1.5em',
				overflow: 'hidden'
            },
            bmMorphShape: {
	              fill: '#373a47'
            },
            bmItemList: {
				display: 'block',
				color: '#b8b7ad',
				padding: '0.1em'
            },
            bmItem: {
				display: 'block',
				//position: 'relative',
				//left: '10px',
                //fontSize: '10px',
            },
            bmOverlay: {
              background: 'rgba(0, 0, 0, 0.3)'
            }
          }
        
        return (
            <div>
            <Menu  styles={ menuStyles } disableOverlayClick noOverlay>
                <div className="menuTitle">Shortcuts</div>
                <table>
                    <tbody>
                        <tr><td className="commandKey">f</td>
                        <td className="commandDesc">Fullscreen</td></tr>
                        <tr><td className="commandKey">p</td>
                        <td className="commandDesc">Toggle projections</td></tr>
                        <tr><td className="commandKey">c</td>
                        <td className="commandDesc">Delete last item</td></tr>
                        <tr><td className="commandKey">C</td>
                        <td className="commandDesc">Delete all items</td></tr>
                    </tbody>
                </table>
            </Menu>
            </div>
        )
    }
}
 
export default SlideMenu

