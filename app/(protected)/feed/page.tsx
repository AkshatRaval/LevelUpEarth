"use client";

import React, { useEffect, useState } from "react";
import {
  Trees,
  Droplets,
  ThumbsUp,
  MessageSquare,
  Recycle,
  Bike,
  Leaf,
} from "lucide-react";

import { useToast } from "@/components/ToastContext";
import { useFeed } from "@/hooks/useFeed";

// Map actions to icons
const getIcon = (type: string) => {
  switch (type) {
    case "plantedTree":
      return <Trees size={24} className="text-emerald-600" />;

    case "wateredPlant":
      return <Leaf size={24} className="text-blue-600" />;

    case "savedWater":
      return <Droplets size={24} className="text-sky-600" />;

    case "cycled":
      return <Bike size={24} className="text-yellow-600" />;

    case "recycledWaste":
      return <Recycle size={24} className="text-teal-600" />;

    default:
      return <Leaf size={24} className="text-green-600" />;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case "plantedTree":
      return "bg-emerald-100";

    case "wateredPlant":
      return "bg-blue-100";

    case "savedWater":
      return "bg-sky-100";

    case "cycled":
      return "bg-yellow-100";

    case "recycledWaste":
      return "bg-teal-100";

    default:
      return "bg-green-100";
  }
};

export default function FeedPage() {

  const {
    feedItems,
    likedActionIds,
    loading,
    toggleLike,
  } = useFeed();

  const [userLikes, setUserLikes] =
    useState<Set<string>>(new Set());

  const [localFeed, setLocalFeed] = useState<any[]>([]);

  const { showToast } = useToast();

  // Hydrate likes from backend
  useEffect(() => {

    if (likedActionIds) {
      setUserLikes(new Set(likedActionIds));
    }

  }, [likedActionIds]);

  // Sync local feed
  useEffect(() => {
    setLocalFeed(feedItems);
  }, [feedItems]);

  const handleLike = async (
    actionId: string,
    isLiked: boolean
  ) => {

    try {

      // Optimistic UI update
      setUserLikes((prev) => {

        const updated = new Set(prev);

        if (isLiked) {
          updated.delete(actionId);
        } else {
          updated.add(actionId);
        }

        return updated;
      });

      // Optimistic count update
      setLocalFeed((prev) =>
        prev.map((item) => {

          if (item.id !== actionId) {
            return item;
          }

          return {
            ...item,
            likes_count: isLiked
              ? Math.max((item.likes_count || 1) - 1, 0)
              : (item.likes_count || 0) + 1,
          };
        })
      );

      await toggleLike(actionId);
    } catch (err: any) {

      // Rollback likes
      setUserLikes((prev) => {

        const rollback = new Set(prev);

        if (isLiked) {
          rollback.add(actionId);
        } else {
          rollback.delete(actionId);
        }

        return rollback;
      });

      // Rollback count
      setLocalFeed((prev) =>
        prev.map((item) => {

          if (item.id !== actionId) {
            return item;
          }

          return {
            ...item,
            likes_count: isLiked
              ? (item.likes_count || 0) + 1
              : Math.max((item.likes_count || 1) - 1, 0),
          };
        })
      );

      showToast(
        err.message || "Failed to toggle like.",
        "error"
      );
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">

      {/* Header */}

      <section className="space-y-2 border-b-4 border-black pb-6">

        <div className="inline-block border-2 border-black bg-blue-300 px-3 py-1 text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Live Updates
        </div>

        <h1 className="text-4xl font-black uppercase italic sm:text-6xl tracking-tighter leading-none">
          GLOBAL{" "}
          <span className="text-emerald-600 underline decoration-black decoration-4 underline-offset-4 italic">
            IMPACT FEED
          </span>
        </h1>

        <p className="font-bold text-slate-700 italic">
          See what the community is doing right now to level up earth.
        </p>

      </section>

      {/* Feed */}

      <section className="space-y-6">

        {loading ? (

          <div className="text-center font-black uppercase">
            Loading Feed...
          </div>

        ) : localFeed.length === 0 ? (

          <div className="border-4 border-black border-dashed p-10 text-center font-bold text-slate-500 italic">
            No impact logged yet globally.
            Be the first to start the movement!
          </div>

        ) : (

          localFeed.map((item) => {

            const profile = Array.isArray(item.profiles)
              ? item.profiles[0]
              : item.profiles;

            const displayName =
              profile?.username ||
              profile?.full_name ||
              "Eco Warrior";

            const isLiked = userLikes.has(item.id);

            return (

              <div
                key={item.id}
                className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
              >

                {/* Header */}

                <div className="flex justify-between items-start mb-4">

                  <div className="flex items-center gap-4">

                    <div
                      className={`p-3 border-4 border-black ${getColor(
                        item.type
                      )} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                    >
                      {getIcon(item.type)}
                    </div>

                    <div>

                      <h3 className="font-black text-xl uppercase tracking-tight">
                        {displayName}
                      </h3>

                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {profile?.origin || "Earth"} •{" "}
                        {new Date(
                          item.created_at
                        ).toLocaleDateString()}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <div className="text-2xl font-black italic text-emerald-600">
                      +{item.points}
                    </div>

                    <div className="text-[10px] uppercase font-bold tracking-widest">
                      Points
                    </div>

                  </div>

                </div>

                {/* Content */}

                <div className="py-4 border-y-4 border-black border-dashed mb-4">

                  <h4 className="text-2xl font-black uppercase italic">
                    {item.title || item.type}
                  </h4>

                  {item.description && (
                    <p className="font-bold text-slate-600 mt-2">
                      {item.description}
                    </p>
                  )}

                </div>

                {/* Image */}

                {item.proof_url && (() => {
                  // Fix legacy URLs that used the wrong bucket name
                  const fixedUrl = item.proof_url.replace(
                    '/storage/v1/object/public/proofs/',
                    '/storage/v1/object/public/action-proofs/'
                  );
                  return (
                    <div className="w-full h-64 border-4 border-black mb-4 overflow-hidden bg-slate-100">
                      <img
                        src={fixedUrl}
                        alt="Proof"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  );
                })()}

                {/* Actions */}

                <div className="flex items-center gap-4 mt-4">

                  <button
                    onClick={() =>
                      handleLike(item.id, isLiked)
                    }
                    className={`
                      flex items-center gap-2
                      border-2 border-black
                      px-4 py-2
                      text-xs font-black uppercase tracking-widest
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                      active:shadow-none
                      active:translate-x-[2px]
                      active:translate-y-[2px]
                      transition-all

                      ${isLiked
                        ? "bg-emerald-300 text-black hover:bg-emerald-400"
                        : "bg-white hover:bg-emerald-50"
                      }
                    `}
                  >

                    <ThumbsUp
                      size={16}
                      className={isLiked ? "fill-current" : ""}
                    />
                    {item.likes_count || 0}
                    <span className="hidden sm:inline">
                      Respect
                    </span>

                  </button>

                  <button
                    onClick={() =>
                      showToast(
                        "Comments coming soon!",
                        "info"
                      )
                    }
                    className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-blue-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >

                    <MessageSquare size={16} />

                    {item.comments_count || 0}

                    <span className="hidden sm:inline">
                      Discuss
                    </span>

                  </button>

                </div>

              </div>
            );
          })
        )}
      </section>
    </div>
  );
}