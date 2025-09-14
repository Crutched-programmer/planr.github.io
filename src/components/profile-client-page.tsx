
"use client";

import React from 'react';
import { ProfileForm } from '@/components/profile-form';


function ProfileClientPageComponent() {
    return (
        <ProfileForm />
    )
}

export const ProfileClientPage = React.memo(ProfileClientPageComponent);
