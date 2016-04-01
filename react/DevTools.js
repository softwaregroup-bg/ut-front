import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
// https://github.com/gaearon/redux-devtools
export default createDevTools(
  <DockMonitor toggleVisibilityKey='alt-h' changePositionKey='alt-w'>
    <LogMonitor />
  </DockMonitor>
);
