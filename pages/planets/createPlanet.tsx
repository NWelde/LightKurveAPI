import React, { useContext, useEffect, useState } from "react";
import Card, { createPlanetCard, ProfileCard } from '../../components/Card';
import { ClimbingBoxLoader } from "react-spinners";

import { UserContext } from "../../context/UserContext";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AccountAvatar from "../../components/AccountAvatar";
import PostFormCard from "../../components/PostFormCard";

export default function PlanetFormCard ( { onCreate } ) {
    // Take TIC id/stellar id, generate in python, return. Require reputation, take reputation. Long-term: generate planets via tic id with dynamic routes
    const supabase = useSupabaseClient();
    const [content, setContent] = useState('');
    const session = useSession();
    const [profile, setProfile] = useState(null);

    const [userReputation, setUserReputation] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [username, setUsername] = useState('');
    const [name, setPlanetName] = useState('');
    const [planetTemperature, setPlanetTemperature] = useState('');
    const [planetRadius, setPlanetRadius] = useState();
    const [ticId, setTicId] = useState(''); // Will later be calculated/generated randomly by python
    const [planetAvatar_url, setPlanetAvatarUrl] = useState(''); // This will be set upon returning the image from python
    const [planetContract, setPlanetContract] = useState(''); // This will be set by default to `0xdf35Bb26d9AAD05EeC5183c6288f13c0136A7b43`
    const [planetTokenId, setPlanetTokenId] = useState(); // This will be set by Thirdweb after it is lazy minted
    const [planetChainId, setPlanetChainId] = useState(''); // Set by default to Goerli, will be changed either by user or by default later
    // forks, forkFrom, posts, articles, datasets, generator (params)
    const [planetMultiplier, setPlanetMultiplier] = useState(); // Set by default to 1
    const [ownerAddress, setOwnerAddress] = useState('');
    const [avatarUrlPre, setAvatarUrlPre] = useState(''); // Used (testing) for when user adds the profile pic for the planet when they're creating it. avatar_url is filled by calling the python/3js/unity generator

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function getProfile () {
        try {
            setLoading(true);
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, reputation, address`)
                .eq('id', session?.user?.id)
                .single()

            if (error && status !== 406) { throw error; };
            if ( data ) {
                setUsername(data.username);
                setUserReputation(data.reputation);
                setOwnerAddress(data.address);
            };
        } catch ( error ) {
            console.log(error);
        } finally {
            setLoading(false);
        };
    };
    
    /*function createPlanet () {
        supabase.from('planetsss').insert({
            temperature: planetTemperature,
            ticId,
            radius: planetRadius,
            userId: session?.user?.id,
            name,
            contract: '0xdf35Bb26d9AAD05EeC5183c6288f13c0136A7b43',
            tokenId: 0,
            chainId: 'goerli',
            ownerAddress,
        }).then(response => {
            if (!response.error) {
                alert(`Planet ${name} created`);
                if ( onCreate ) {
                    onCreate();
                }
            }
        });
    }*/

    function createPlanet () {
        supabase.from('planetsss').insert({
          owner: session?.user?.id, // This is validated via RLS so users can't pretend to be other user
          content, // : content,
          temperature: planetTemperature,
          ownerAddress: ownerAddress,
          ticId: ticId, // Send this to Flask as a post request, then do axios.get to receive the result (graph, image). Request for radius from Tic.
          /* ticId,
            radius: planetRadius,
            contract: '0xdf35Bb26d9AAD05EeC5183c6288f13c0136A7b43',
            tokenId: 0,
            chainId: 'goerli', */
        }).then(response => {
          if (!response.error) {
            /*const ticResponse = fetch('check_ticId', {
                methods: "POST",
                headers: {
                    'Content-Type' : 'application/json'
                }, https://javascript.plainenglish.io/sending-a-post-to-your-flask-api-from-a-react-js-app-6496692514e
                body: JSON.stringify(ticId)
            })*/
            alert(`Post ${content} created`);
            setContent(''); setPlanetTemperature('');
            if ( onCreate ) {
              onCreate();
            }
          }
        });
    }

    useEffect (() => {
        supabase.from('profiles')
            .select(`avatar_url`)
            .eq('id', session?.user?.id)
            .then(result => {
                setAvatarUrl(result.data[0].avatar_url);
            });
    }, []);

    useEffect(() => {
        if (!session?.user?.id) {
          return;
        }
    
        supabase.from('profiles')
          .select()
          .eq('id', session?.user?.id)
          .then(result => {
            if (result.data.length) {
              setProfile(result.data[0]);
            }
          })
      }, [session?.user?.id]);

    useEffect(() => {
        getProfile();
    }, [session]);

    const uploadPlanetAvatar: React.ChangeEventHandler<HTMLInputElement> = async ( event ) => {
        try {
            setUploading(true);
        } catch ( error ) {
            console.log(error)
        } finally {
            setUploading(false);
        }
    }

    if ( userReputation < 1 ) return (
        <div>You need to improve your reputation to be able to afford this planet</div>
    );

    return (
        <>
            <ProfileCard noPadding={false}>
                <div className="flex">
                    <div>
                        <AccountAvatar uid={session?.user?.id}
                            url={avatar_url}
                            size={60} />
                    </div> { session?.user?.id && (
                        <>
                            <div className="columns-1"><textarea value={content} onChange={e => setContent(e.target.value)} className="grow p-3 h-14" placeholder={`Planet name?`} />
                            <textarea value={planetTemperature} onChange={e => setPlanetTemperature(e.target.value)} className='grow p-3 h-14' placeholder={"What's the temperature?"} />
                            <textarea value={ticId} onChange={e => setTicId(e.target.value)} className='grow p-3 h-14' placeholder={"TIC ID"} /></div>
                        </>
                    )}
                </div>
                <div className="grow text-right">
                    <button onClick={createPlanet} className="bg-socialBlue text-white px-6 py-1 rounded-md">Create planet</button>
                </div>
            </ProfileCard>
        </>
    )
}