import { S3_URL, SCREEN_HEIGHT, SCREEN_WIDTH } from "../lib/constants";
// import { ResizeMode, Video } from "expo-av";
import { customHTMLElementModels } from "../lib/Utils";
import RenderHTML from "react-native-render-html";
import YoutubePlayer from "react-native-youtube-iframe";
import React, { useEffect } from "react";
import {
  Linking,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import Image from "../lib/Image";
import Video from "react-native-video";
import { set } from "lodash";
import {
  ImageGallery,
  ImageObject,
} from "@georstat/react-native-image-gallery";
import Gallery, { Image as IImage } from "react-native-image-gallery";

function RenderTheHtml({ uri }: { uri: string }) {
  // const [getAllPhotos, setGetAllPhotos] = React.useState<boolean>(false);
  const [allPhotos, setAllPhotos] = React.useState<IImage[]>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const getAllImages = (uri: string) => {
    const regex = /<img[^>]+src="([^">]+)/g;
    const matches = uri.match(regex);
    if (!matches) return;
    const allPhotosLinks: IImage[] = [];
    matches.forEach((match) => {
      const link = match.split("src=")[1].split('"')[1];
      // allPhotosLinks.push({
      //   source: {
      //     uri: link,
      //   },

      //   // id: link,
      //   // url: link,
      // });
      setAllPhotos([]);
    });
  };
  const closeGallery = () => {
    setIsOpen(false);
  };
  // useEffect(() => {
  //   getAllImages(uri);
  // }, []);
  return (
    <>
      {/* <ImageGallery close={closeGallery} isOpen={isOpen} images={allPhotos} /> */}
      {/* <Gallery style={{ flex: 1, backgroundColor: "black" }} images={[]} /> */}
      <RenderHTML
        tagsStyles={{
          p: {
            color: "white",
            fontSize: 20,
            textAlign: "left",
          },
          h1: { color: "white", alignSelf: "center" },
          h2: { color: "white" },
          h3: { color: "white" },
          a: { color: "white" },
          li: { color: "white" },
          ul: { color: "white" },
          ol: { color: "white" },
          img: {
            alignSelf: "center",
            resizeMode: "contain",
            marginBottom: 10,
            marginTop: 10,
          },
          video: {
            alignSelf: "center",
            flex: 1,
          },
        }}
        renderersProps={{ img: { enableExperimentalPercentWidth: true } }}
        customHTMLElementModels={customHTMLElementModels}
        source={{ html: uri }}
        contentWidth={SCREEN_WIDTH}
        renderers={{
          video: (obj1: any, obj2: any) => {
            let link: string | undefined = obj1["tnode"].domNode.attribs.src;
            if (
              !link ||
              (!link.startsWith(S3_URL) && !link.startsWith("file:///"))
            )
              return null;
            return (
              <>
                <Video
                  source={{ uri: link }}
                  resizeMode={"contain"}
                  style={[styles.videoStyle, {}]}
                  controls={true}
                  paused={true}
                />
              </>
            );
          },
          img: (obj1: any, obj2: any) => {
            let link: string | undefined = obj1["tnode"].domNode.attribs.src;
            if (
              !link ||
              (!link.startsWith(S3_URL) && !link.startsWith("file:///"))
            )
              return null;

            return (
              <TouchableOpacity activeOpacity={1}>
                <Image source={{ uri: link }} style={styles.imgStyle} />
              </TouchableOpacity>
            );
          },
          yt: (obj1: any, obj2: any) => {
            let link: string = obj1["tnode"].domNode.children[0].data;
            if (!link) return null;
            var regExp =
              /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            var match = link.match(regExp);
            const videoId: string | false =
              match && match[7].length == 11 ? match[7] : false;
            if (!videoId) return null;
            return (
              <>
                <YoutubePlayer height={300} play={false} videoId={videoId} />
              </>
            );
          },
          a: (obj1: any, obj2: any) => {
            // have to use children as cannot find attr
            let link: string | undefined =
              obj1["tnode"].domNode.children[0].data || undefined;
            if (!link || link.length <= 0) return null;
            const url = link.split(" ")[0];
            const url_name = link.split(" ")[1];
            return (
              <Text style={styles.aStyle} onPress={() => Linking.openURL(url)}>
                {url_name}
              </Text>
            );
          },
          p: (obj1: any, obj2: any) => {
            let text: string | undefined =
              obj1["tnode"].domNode.children[0].data || undefined;
            if (!text || text.length <= 0) return null;
            return <Text style={styles.pTextStyle}>{text}</Text>;
          },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  aStyle: {
    color: "#007AFF",
    fontWeight: "700",
    textDecorationLine: "underline",
    textDecorationColor: "#007AFF",
  },
  imgStyle: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT / 4,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
    borderColor: "white",
    borderWidth: 1,
    aspectRatio: 4 / 3,
    zIndex: 100,
    justifyContent: "space-evenly",
  },
  pTextStyle: {
    color: "white",
    alignSelf: "flex-start",
    width: SCREEN_WIDTH,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  videoContainerStyle: {
    flex: 1,
    height: 300, // Adjust the height as needed to fit your videos
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  videoStyle: {
    flex: 1,
    minWidth: 300,
    minHeight: 300,
    aspectRatio: 4 / 3,
  },
});

export default React.memo(RenderTheHtml);
