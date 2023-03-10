import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PlanetCoverImage from "../../components/Planets/Cover";
import PlanetAvatar from "../../components/Planets/PlanetAvatar";
import PlanetTabs from "../../components/Planets/PlanetNavigation";
import { GameplayLayout } from "../../components/Core/Layout";
import { useContract, useContractRead, useContractWrite, useLazyMint } from "@thirdweb-dev/react";
import Link from "next/link";

// import { Database } from "../../utils/database.types"; // Use this for later when we are drawing from the Planets table
// type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetPage () {
    const router = useRouter();
    const tab = router?.query?.tab?.[0] || 'planet'; // Planet stats & information
    const planetId = router.query.id;

    const supabase = useSupabaseClient();
    const session = useSession();
    const [planet, setPlanet] = useState(null);
    const [planetOwner, setPlanetOwner] = useState(null);
    const [planetUri, setPlanetUri] = useState();
    const [username, setUsername] = useState('');
    const [playerReputation, setPlayerRepuation] = useState<number>();

    const { contract } = useContract(planet?.contract);
    /*const { mutateAsync: lazyMint, isLoading } = useContractWrite(contract, "lazymint");
    const lazyMintAnomaly = async () => {
        try {
            const data = await lazyMint([ _amount, _baseURIForTokens, _data ]);
            console.info('contract call success: ', data);
        } catch (err) {
            console.error('contract call failure: ', err);
        }
    }*/
    const {
        mutate: lazyMint,
        isLoading,
        error,
    } = useLazyMint(contract);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!planetId) { return; }
        fetchPlanet();
    })

    function fetchPlanet () {
        supabase.from('planetsss')
            .select("*")
            .eq('id', planetId) // How should the ID be generated -> similar to how `userId` is generated? Combination of user + org + article + dataset number??
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setPlanet(result.data[0]); /*console.log(planet);*/ setPlanetOwner(planet?.ownerId); };
            }
        );
    }

    async function getProfile () {
        try {
            setLoading(true);
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, reputation`)
                .eq('id', session?.user?.id)
                .single()
            
            if (error && status !== 406) { throw error; };
            if (data) { setUsername(data.username); setPlayerRepuation(data.reputation); };
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const claimPlanet = async () => {
        try {
            const { data, error } = await supabase
                .from('planetsss')
                .update([
                    { owner: session?.user?.id, /*userId: username*/ }
                ])
                .eq('id', planetId);
                updatePlayerReputation(); // Do this for posts, journals as well
            
                if (error) throw error;
        } catch (error: any) {
            console.log(error);
        }
    }

    const updatePlayerReputation = async () => {
        let newReputation = playerReputation + 1;
        setPlayerRepuation(newReputation);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update([
                    { reputation: newReputation, }
                ])
                .eq('id', session?.user?.id);

                if (error) throw error;
        } catch (error: any) {
            console.log(error);
        }
    }

    function showNftMetadataUri (planet) {
        const { contract } = useContract(`{planet?.contract}`);
        const { data, isLoading } = useContractRead( contract, "uri", `{planet?.tokenId}`)
        if ( data ) {
            setPlanetUri( data );
        }
    }

    return (
        <GameplayLayout>
            <Layout hideNavigation={true}> {/* Should be set to <ProfileLayout /> */}
                <Card noPadding={true}>
                    <div className="relative overflow-hidden rounded-md">
                        <PlanetCoverImage url={planet?.cover} editable={true} onChange={fetchPlanet()} />
                        <div className="absolute top-40 mt-12 left-5">
                            {planet && (<PlanetAvatar // Add upload handler from AccountAvatarV1
                                uid={''} // Behaviour for profile: `{session?.user!.id}`. Right now it's just set to a default, so same planet every time. In practice, it should infer the planet id based on the url (which will have the id inside it)
                                url={planet?.avatar_url}
                                size={120} /> )}
                        </div>
                        <div className="p-4 pt-0 md:pt-4 pb-0">
                        <div className="ml-24 md:ml-40 mt-1">
                            <br /><div className="flex ml--2"> {/* Profile Name - Set up styling rule to remove the ml-10 on mobile */}<h1 className="text-3xl font-bold">{planet?.content}</h1>{/* Only show userma,e on mouseover, along with the address (like a metamask profile view) <p className="@apply text-blue-200 leading-4 mb-2 mt-2">{profile?.username}</p>*/}</div>
                            <div className="text-gray-500 mt-1 ml-0">{planet?.temperature} KELVIN</div>{/*<div className="items-center cursor-pointer absolute right-0 bottom-0 m-2"><label className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md shadow-black cursor-pointer">
                                <input type='file' className='hidden' /> {/* Use this to update location, address (will later be handled by Thirdweb), username, profile pic. Maybe just have a blanket button to include the cover as well */} {/*
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>Update profile</label>
                            </div>*/}
                            
                            {/*<div className="@apply text-blue-200 leading-4 mb-2 mt-2 ml-10">{profile?.address}{/* | Only show this on mouseover {profile?.username}*/}{/*</div> {/* Profile Location (from styles css) */}
                        </div>
                        <PlanetTabs activeTab={tab} planetId={planet?.id} /><br /><br />
                        <p>Planet ID: {planet?.id}</p>
                        <p>Temperatue: {planet?.temperature} Kelvin</p>
                        <p>Created at: {planet?.created_at}</p>
                        <p>Contract: {planet?.contract}</p>
                        <br /><br /><br />
                        <button onClick={claimPlanet}>Claim Planet</button>
                        <br /><br />
                        <p>Contract info: {planet?.contract} ↝ {planet?.tokenId} on {planet?.chainId} </p>
                        <br /><br />
                        <p>Owner of this anomaly: {planet?.owner}</p>
                        {planet?.owner == session?.user?.id /*&& planet?.userId == username*/ && (
                            <>
                                <div>Hello World</div><br />
                                <div><button onClick={() => lazyMint({ metadatas: [{ name: planet?.content, media: planet?.cover, description: planet?.ticId, properties: { trait_type1: 'value' }}]})}>Mint NFT of planet</button></div>
                                <Link href='https://deepnote.com/workspace/star-sailors-49d2efda-376f-4329-9618-7f871ba16007/project/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da/notebook/notebook-377269a4c09f46908203c402cb8545b0'><div><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/b56a0704304940e49c38823795edaa20/b1b6860bdf364fcea023992c1ae527d6?height=294.6875" height="294.6875" width="500"/><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/377269a4c09f46908203c402cb8545b0/2b82b4f1d68a4ca282977277e09df860?height=43" height="650" width="100%"/></div></Link> {/* https://codesandbox.io/s/nextjs-example-react-jupyter-notebook-viewer-lzjcb5?file=/pages/index.js:21-33 */}
                            </>
                        )}
                        <br /><br /><br />
                        </div>
                    </div>
                </Card>
            </Layout>
        </GameplayLayout>
    );
};