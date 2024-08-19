import {NavigationGroup} from "./navigation";

export const globalNavigation: NavigationGroup[] = [
    {
        text: 'Feedback',
        path: '/feedback',
        items: [
            {
                text: 'Odebrane',
                path: '/inbox',
                default: true
            },
            {
                text: 'Wysłane',
                path: '/sent',
            },
            {
                text: 'Statystyki',
                path: '/stats',
            },
            {
                text: 'Chapter',
                path: '/chapter/stats',
                condition: context => context.isLeader,
            }
        ]
    },
    {
        text: 'Umiejętności',
        path: '/skill',
        items: [
            {
                text: 'Roadmap',
                path: '/roadmap',
                default: true
            },
            {
                text: 'Moje',
                path: '/survey'
            },
            {
                text: 'Chapter',
                path: '/chapter',
                condition: context => context.isLeader
            },
            {
                text: 'Katalog',
                path: '/browser',
            }
        ]
    },
    {
        text: 'Ocena okresowa',
        path: '/assessment',
        items: [
            {
                text: 'Moje',
                path: '',
                default: true
            }
        ]
    },
    {
        text: 'Ankiety',
        path: '/survey',
        items: [
            {
                text: 'Odebrane',
                path: '/inbox',
                default: true
            },
            {
                text: 'Wysłane',
                path: '/campaign',
            }
        ]
    },
]
