import { useEthPrice } from "@components/hooks/useEthPrice";
import { useOwnedCourses, useWalletInfo } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Breadcrumbs, Button, Loader, Message } from "@components/ui/common";
import { CourseCard, CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { OrderModal } from "@components/ui/order";

import { getAllCourse } from "content/courses/fetcher";
import { useState } from "react";

export default function Marketplace({ courses }) {
  const { web3, contract, requireInstall } = useWeb3();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { hasConnectedWallet, account, isConnecting } = useWalletInfo();
  const { ownedCourses } = useOwnedCourses(courses, account.data);
  const [isNewPurchase, setIsNewPurchase] = useState(true);

  const purchaseCourse = async (order) => {
    const hexCourseId = web3.utils.utf8ToHex(selectedCourse.id);
    // emailHash + courseHash
    const orderHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data }
    );

    const value = web3.utils.toWei(String(order.price));

    if (isNewPurchase) {
      const emailHash = web3.utils.sha3(order.email);
      const proof = web3.utils.soliditySha3(
        {
          type: "bytes32",
          value: emailHash,
        },
        {
          type: "bytes32",
          value: orderHash,
        }
      );

      _purchaseCourse(hexCourseId, proof, value);
    } else {
      _repurchaseCourse(orderHash, value);
    }
  };

  const _purchaseCourse = async (hexCourseId, proof, value) => {
    try {
      const result = await contract.methods
        .purchaseCourse(hexCourseId, proof)
        .send({
          from: account.data,
          value,
        });

      console.log(result);
    } catch {
      console.log("Purchase course: Operation has failed.");
    }
  };

  const _repurchaseCourse = async (courseHash, value) => {
    try {
      const result = await contract.methods.repurchaseCourse(courseHash).send({
        from: account.data,
        value,
      });

      console.log(result);
    } catch {
      console.log("Purchase course: Operation has failed.");
    }
  };

  return (
    <>
      <MarketHeader />
      <CourseList courses={courses}>
        {(course) => {
          const owned = ownedCourses.lookup[course.id];
          return (
            <CourseCard
              disabled={!hasConnectedWallet}
              key={course.id}
              state={owned?.state}
              course={course}
              Footer={() => {
                if (requireInstall) {
                  return (
                    <Button size="sm" disabled={true} variant={"lightPurple"}>
                      Install
                    </Button>
                  );
                }

                if (isConnecting) {
                  return (
                    <Button size="sm" disabled={true} variant={"lightPurple"}>
                      <Loader size="sm" />
                    </Button>
                  );
                }

                if (!ownedCourses.hasInitialResponse) {
                  return <div style={{ height: "42px" }} />;
                }

                if (owned) {
                  return (
                    <>
                      <div className="flex">
                        <Button
                          onClick={() => alert("You are owner of this course.")}
                          size="sm"
                          disabled={false}
                          variant={"white"}
                        >
                          Yours &#10004;
                        </Button>
                        {owned.state === "deactivated" && (
                          <div className="ml-1">
                            <Button
                              onClick={() => {
                                setIsNewPurchase(false);
                                setSelectedCourse(course);
                              }}
                              size="sm"
                              disabled={false}
                              variant={"purple"}
                            >
                              Fund to Activate
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                }

                return (
                  <Button
                    size="sm"
                    disabled={!hasConnectedWallet}
                    onClick={() => setSelectedCourse(course)}
                    variant={"lightPurple"}
                  >
                    Purchase
                  </Button>
                );
              }}
            />
          );
        }}
      </CourseList>

      {selectedCourse && (
        <OrderModal
          isNewPurchase={isNewPurchase}
          course={selectedCourse}
          onSubmit={purchaseCourse}
          onClose={() => {
            setSelectedCourse(null);
            setIsNewPurchase(true);
          }}
        />
      )}
    </>
  );
}

export function getStaticProps() {
  const { data } = getAllCourse();
  return {
    props: {
      courses: data,
    },
  };
}

Marketplace.Layout = BaseLayout;
