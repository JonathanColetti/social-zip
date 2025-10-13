import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IContentFilter } from "../../screens/Home";
import { FormatMutation, FormatQuery } from "../../api/graphql/FormatRequest";
import {
  GetHashtagRecomendations,
  GetPinnedHashtags,
  // GetPinnedOrRecomendedHashtags,
  PinHashtag,
  UnpinHashtag,
} from "../../api/graphql/Queries";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import ActionSheet from "react-native-actionsheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CAROUSEL_FILTER_COLOR,
  CAROUSEL_FILTER_COLOR_ANDRIOD,
  CAROUSEL_HEIGHT,
  CAROUSEL_WIDTH,
  DEFAULT_FILTERS,
  DEFAULT_FILTERS_UNLOGGEDIN,
} from "../lib/constants";
import FilterItem from "../lib/CategoryItem";
import translator from "../translations/translator";
import Container, { Toast } from "toastify-react-native";
import Animated from "react-native-reanimated";
import { Modal, StyleSheet, Platform } from "react-native";
import { ReportSomething } from "../lib/Utils";
import Modals from "../../screens/modals/Modals";
import { GlobalContext } from "../context/Global";
export interface ITopHashtagNavigationProps {
  setContentFilter: (filter: IContentFilter) => void;
  contentFilter: IContentFilter;
  startingFilter: IContentFilter | null;
}
/*

  Things I want this to do,
  @params setContentFilter: (filter: IContentFilter) => void;
  @params contentFilter: IContentFilter;
  case 1:
    if route.params is not null, then set the content filter to that and prepend it to the list of filters
  default:
    if logged in, add following and explore
    else add explore
    get hashtags
*/

function TopHashtagNavigation({
  setContentFilter,
  contentFilter,
  startingFilter,
}: ITopHashtagNavigationProps) {
  const {
    authState: { id, authType, locale },
  } = useContext(GlobalContext);
  const [contentFilters, setContentFilters] = useState<IContentFilter[]>(
    id && authType && id !== "" && authType !== ""
      ? DEFAULT_FILTERS_UNLOGGEDIN(locale)
      : DEFAULT_FILTERS(locale)
  );

  const [pageNum, setPageNum] = useState<number>(0);
  const [pinnedHashtagPageNum, setPinnedHashtagPageNum] = useState<number>(0);
  const [openReportModal, setOpenReportModal] = useState<boolean>(false);
  const topRef = useRef<ICarouselInstance>(null);
  const filterActionSheetRef = useRef<ActionSheet>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (startingFilter) {
      if (id && authType && id !== "" && authType !== "") {
        setContentFilters([startingFilter, ...DEFAULT_FILTERS(locale)]);
        return;
      }
      setContentFilters([
        startingFilter,
        ...DEFAULT_FILTERS_UNLOGGEDIN(locale),
      ]);
      return;
    }
  }, [startingFilter]);
  useEffect(() => {
    CheckPinnedAndReccommend();
  }, []);

  const styles = Styles(insets.top);

  const CheckPinnedAndReccommend = async (): Promise<void> => {
    const pinnedFilters = await FormatQuery(
      GetPinnedHashtags(),
      {
        pageNum: pinnedHashtagPageNum,
      },
      `${id}:${authType}`
    );

    if (
      !pinnedFilters ||
      !pinnedFilters.data ||
      !pinnedFilters.data.getPinnedHashtags ||
      pinnedFilters.data.getPinnedHashtags.length <= 0
    ) {
      const recommendedHashtags = await FormatQuery(
        GetHashtagRecomendations(),
        {
          pageNum: pageNum,
        },
        `${id}:${authType}`
      );
      if (
        !recommendedHashtags ||
        !recommendedHashtags.data ||
        !recommendedHashtags.data.getHashtags ||
        recommendedHashtags.data.getHashtags.length <= 0
      )
        return;

      setContentFilters([
        ...contentFilters,
        ...recommendedHashtags.data.getHashtags,
      ]);
      setPageNum(pageNum + 1);
      return;
    }
    setContentFilters([
      ...contentFilters,
      ...pinnedFilters.data.getPinnedHashtags,
    ]);
    setPinnedHashtagPageNum(pinnedHashtagPageNum + 1);
  };
  const GetMoreContentFilters = async (): Promise<void> => {
    CheckPinnedAndReccommend();
  };
  const onFilterChange = (index: number): void => {
    setContentFilter(contentFilters[index]);
    Haptics.selectionAsync();
    GetMoreContentFilters();
  };
  const handleLongPressHashtag = (): void => {
    if (!filterActionSheetRef.current) return;
    filterActionSheetRef.current.show();
  };
  const onPressFilter = (animationValue: any) => {
    if (!topRef.current) return;
    topRef.current.scrollTo({
      count: animationValue.value,
      animated: true,
    });
  };

  const pressedHashtag = async (index: number) => {
    try {
      if (index === 0) {
        if (
          !topRef.current ||
          !contentFilters[topRef.current.getCurrentIndex()]
        ) {
          Toast.error(translator(locale).t("pleasetryagain"));
          return;
        }
        if (contentFilters[topRef.current.getCurrentIndex()].isPinned) {
          const didUnpin = await FormatMutation(
            UnpinHashtag(),
            {
              hashtag: contentFilters[topRef.current.getCurrentIndex()].hashtag,
            },
            `${id}:${authType}`
          );
          if (!didUnpin || !didUnpin.data || !didUnpin.data.unfollowHashtag) {
            Toast.error(translator(locale).t("pleasetryagain"));
            return;
          }
          Toast.success(translator(locale).t("success"));
          return;
        }

        const didPin = await FormatMutation(
          PinHashtag(),
          {
            hashtag: contentFilters[topRef.current.getCurrentIndex()].hashtag,
          },
          `${id}:${authType}`
        );
        if (!didPin || !didPin.data || !didPin.data.followHashtag) {
          Toast.error(translator(locale).t("pleasetryagain"));
          return;
        }

        Toast.success(translator(locale).t("success"));
        return;
      } else if (index === 1) {
        if (
          !topRef.current ||
          !contentFilters[topRef.current.getCurrentIndex()]
        ) {
          return;
        }
      }
    } catch (error) {
      Toast.error(translator(locale).t("pleasetryagain"));
    }
  };

  const renderTheItem = useCallback(
    ({
      item,
      animationValue,
    }: {
      item: IContentFilter;
      animationValue: Animated.SharedValue<number>;
    }) => {
      return (
        <>
          <FilterItem
            key={item.hashtag}
            accentColor={
              Platform.OS === "android"
                ? CAROUSEL_FILTER_COLOR_ANDRIOD
                : CAROUSEL_FILTER_COLOR
            }
            isPinned={item.isPinned}
            animationValue={animationValue}
            label={item.hashtag}
            onPress={() => onPressFilter(animationValue)}
            onLongPress={handleLongPressHashtag}
          />
        </>
      );
    },
    []
  );
  const onReportModalSet = async (values: any) => {
    if (!topRef.current || !contentFilters[topRef.current.getCurrentIndex()]) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    if (!id || !authType) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    const hashtagId = contentFilters[topRef.current.getCurrentIndex()];
    await ReportSomething(
      values,
      null,
      null,
      null,
      hashtagId.hashtag,
      id,
      authType
    );
  };
  return (
    <>
      <BlurView tint="dark" style={styles.blurViewContainer} intensity={80}>
        <Container theme={"dark"} position="top" />
        <ActionSheet
          destructiveButtonIndex={2}
          options={[
            translator(locale).t("pinorunpin"),
            translator(locale).t("report"),
            translator(locale).t("cancel"),
          ]}
          cancelButtonIndex={2}
          ref={filterActionSheetRef}
          title={translator(locale).t("whatwouldyouliketodo")}
          onPress={pressedHashtag}
        />
        <Modal
          transparent
          animationType="slide"
          presentationStyle="overFullScreen"
          style={{}}
          visible={openReportModal}
        >
          <Modals
            setModalOpen={setOpenReportModal}
            title={translator(locale).t("report")}
            onEnter={onReportModalSet}
          />
        </Modal>
        <Carousel
          ref={topRef}
          data={contentFilters}
          renderItem={renderTheItem}
          width={CAROUSEL_WIDTH}
          height={CAROUSEL_HEIGHT}
          onSnapToItem={onFilterChange}
          onScrollEnd={GetMoreContentFilters}
          style={styles.carouselContainer}
          windowSize={13}
          pagingEnabled
        />
      </BlurView>
    </>
  );
}

const Styles = (paddingTop: number) =>
  StyleSheet.create({
    blurViewContainer: {
      paddingTop: paddingTop / 3,
      height: CAROUSEL_HEIGHT,
      zIndex: 999999,
    },
    carouselContainer: {
      width: "100%",
      height: CAROUSEL_HEIGHT,
      borderRadius: 20,
    },
  });

export default TopHashtagNavigation;
