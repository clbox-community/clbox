// TODO: do przecięcia zależność na Profile, publiczny profil powinien być pochodną (modelem do odczytu) a nie projekcją pełnego profilu
import { Profile } from './profile';

export type UserPublicProfile = Pick<
    Profile,
    'display_name'
    | 'email'
    // TODO: wszystko poniżej tego komentarza nie wydaje się potrzebne w publicznym profilu
    | 'chapterLeader'
    | 'teams'
    | 'projects'
    | 'seniority'
    | 'textForm'
    | 'roles'
>;
