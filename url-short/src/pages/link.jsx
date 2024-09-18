import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader, BeatLoader } from "react-spinners";
import { UrlState } from "@/context";
import { getUrl, deleteUrl, getClicksForUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon, Trash, Download, Copy } from "lucide-react";

const LinkPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = UrlState();

  const {
    loading,
    data: url,
    fn: fetchUrl,
    error,
  } = useFetch(getUrl, { id, user_id: user?.id });

  const {
    loading: loadingStats,
    data: stats,
    fn: fetchStats,
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: deleteUrlFn } = useFetch(deleteUrl, id);

  useEffect(() => {
    fetchUrl();
  }, []);

  useEffect(() => {
    if (!error && !loading) fetchStats();
  }, [loading, error]);

  if (error) {
    navigate("/dashboard");
  }

  const link = url?.custom_url || url?.short_url || "";

  const handleDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = url?.qr;
    anchor.download = url?.title || "download.png";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleDelete = async () => {
    await deleteUrlFn();
    navigate("/dashboard");
  };

  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="ml-7 flex flex-col gap-8 sm:flex-row justify-between">
        <div className="flex flex-col items-start gap-8 rounded-lg sm:w-2/5">
          <span className="text-6xl font-extrabold hover:underline cursor-pointer">
            {url?.title}
          </span>
          <a
            href={`https://trimrr.in/${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl sm:text-4xl text-blue-400 font-bold hover:underline cursor-pointer"
          >
            https://trimrr.in/{link}
          </a>
          <a
            href={url?.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline cursor-pointer"
          >
            <LinkIcon className="p-1" />
            {url?.original_url}
          </a>
          <span className="flex items-end font-extralight text-sm">
            {new Date(url?.created_at).toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                navigator.clipboard.writeText(`https://trimrr.in/${link}`)
              }
            >
              <Copy />
            </Button>
            <Button variant="ghost" onClick={handleDownload}>
              <Download />
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash />
              )}
            </Button>
          </div>
          <img
            src={url?.qr}
            className="w-full self-center sm:self-start ring ring-blue-500 p-1 object-contain"
            alt="QR Code"
          />
        </div>

        <Card className="sm:w-3/5">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold">Stats</CardTitle>
          </CardHeader>
          {stats && stats.length ? (
            <CardContent className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{stats.length}</p>
                </CardContent>
              </Card>
              <CardTitle>Location Data</CardTitle>
              <Location stats={stats} />
              <CardTitle>Device Info</CardTitle>
              <DeviceStats stats={stats} />
            </CardContent>
          ) : (
            <CardContent>
              {!loadingStats ? "No Statistics yet" : "Loading Statistics.."}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

export default LinkPage;
