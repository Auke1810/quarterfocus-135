import { createMemoryRouter } from 'react-router-dom';
import { TaskView } from '@/components/views/TaskView';
import { Root } from './Root';
import { QuarterGoalsView } from '@/components/views/QuarterGoalsView';
import { VisionView } from '@/components/views/VisionView';
import { ReviewView } from '@/components/views/ReviewView';

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
      {
        path: '/quarter-goals',
        element: <QuarterGoalsView />,
      },
      {
        path: '/vision',
        element: <VisionView />,
      },
      {
        path: '/review',
        element: <ReviewView />,
      },
    ],
  },
];

// Voor Chrome extensies gebruiken we een memory router
// Dit zorgt ervoor dat de routing binnen de extensie werkt zonder de URL te wijzigen
export const router = createMemoryRouter(routes, {
  initialEntries: ['/'],
  initialIndex: 0,
});
