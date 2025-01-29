import { createMemoryRouter } from 'react-router-dom';
import { TaskView } from '@/components/views/TaskView';
import { Root } from './Root';

const routes = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <TaskView viewType="focus" />,
      },
      {
        path: '/tomorrow',
        element: <TaskView viewType="tomorrow" />,
      },
      {
        path: '/week',
        element: <TaskView viewType="week" />,
      },
    ],
  },
];

export const router = createMemoryRouter(routes);
