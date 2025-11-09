import { View, TouchableOpacity, Modal, ScrollView } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp, NavigationProp } from "@react-navigation/native"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { AlertModal } from "@/components/AlertModal"
import { ImageGallery } from "@/components/ImageGallery"
import { HeroCard } from "@/components/PostDetail/HeroCard"
import { RoleCard } from "@/components/PostDetail/RoleCard"
import { AuditionCard } from "@/components/PostDetail/AuditionCard"
import { PerformanceCard } from "@/components/PostDetail/PerformanceCard"
import { BenefitsCard } from "@/components/PostDetail/BenefitsCard"
import { ContactCard } from "@/components/PostDetail/ContactCard"
import { translate } from "@/i18n"
import { useAppTheme } from "@/theme/context"
import { usePostDetail } from "@/hooks/usePostDetail"
import { AppStackParamList } from "@/navigators/types"
import {
  $container,
  $centerContainer,
  $section,
  $sectionTitle,
  $descriptionText,
  $tagsContainer,
  $tag,
  $tagText,
  $actionButtonsContainer,
  $editButton,
  $editButtonText,
  $deleteButton,
  $deleteButtonText,
  $buttonIcon,
  $fullWidthImageSection,
  $modalOverlay,
  $modalContent,
  $modalHeader,
  $modalTitle,
  $closeButton,
  $closeButtonText,
  $modalPostTitle,
  $modalOrgName,
  $modalScrollView,
  $rolesSection,
  $sectionLabel,
  $roleItem,
  $roleItemText,
  $modalRoleDetailText,
  $formInput,
  $modalButtons,
  $cancelButton,
  $cancelButtonText,
  $submitButton,
  $submitButtonText,
} from "./PostDetailScreen.styles"

type RoutePropType = RouteProp<AppStackParamList, "PostDetail">

export const PostDetailScreen = () => {
  const route = useRoute<RoutePropType>()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()
  const { postId } = route.params
  const { themed } = useAppTheme()

  const {
    post,
    loading,
    // userProfile, // Not used in this component
    showApplicationModal,
    applications,
    hasApplied,
    myApplication,
    applicationMessage,
    applicationPhoneNumber,
    applicationExperience,
    applicationRolePreference,
    submittingApplication,
    isMyPost,
    alertState,
    setShowApplicationModal,
    setApplicationMessage,
    setApplicationPhoneNumber,
    setApplicationExperience,
    setApplicationRolePreference,
    handleDelete,
    handleApplyButtonClick,
    handleApply,
    handleWithdrawApplication,
    handleViewApplications,
    hideAlert,
  } = usePostDetail(postId)

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="게시글" />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="로딩 중..." />
          </View>
        </View>
      </Screen>
    )
  }

  if (!post) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="게시글" />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="게시글을 찾을 수 없습니다." />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader title="모집 공고" />
      <View style={themed($container)}>
        {/* Hero Card */}
        <HeroCard
          post={post}
          isMyPost={!!isMyPost}
          applicationsCount={applications.length}
          hasApplied={hasApplied}
          myApplication={myApplication}
          submittingApplication={submittingApplication}
          onApplyClick={handleApplyButtonClick}
          onWithdraw={handleWithdrawApplication}
          onViewApplications={handleViewApplications}
        />

        {/* Image Gallery */}
        {(post.postType === 'images' || post.images?.length > 0) && post.images && post.images.length > 0 && (
          <View style={themed($fullWidthImageSection)}>
            <ImageGallery images={post.images} />
          </View>
        )}

        {/* Description */}
        <View style={themed($section)}>
          <Text preset="subheading" text="상세 설명" style={themed($sectionTitle)} />
          <Text text={post.description} style={themed($descriptionText)} />
        </View>

        {/* Role Cards */}
        <RoleCard roles={post.roles} />

        {/* Audition Info */}
        <AuditionCard audition={post.audition} />

        {/* Performance Info */}
        <PerformanceCard performance={post.performance} />

        {/* Benefits Info */}
        <BenefitsCard benefits={post.benefits} />

        {/* Contact Info */}
        <ContactCard contact={post.contact} />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={themed($section)}>
            <Text preset="subheading" text="태그" style={themed($sectionTitle)} />
            <View style={themed($tagsContainer)}>
              {post.tags.map((tag, index) => (
                <View key={index} style={themed($tag)}>
                  <Text text={tag} style={themed($tagText)} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Admin Action Buttons */}
        {isMyPost && (
          <View style={themed($actionButtonsContainer)}>
            <TouchableOpacity
              style={themed($editButton)}
              onPress={() => navigation.navigate("CreatePost", { postId: post.id, isEdit: true })}
              accessibilityLabel={translate("bulletinBoard:actions.editPost")}
            >
              <Text text="✏️" style={themed($buttonIcon)} />
              <Text text={translate("bulletinBoard:actions.edit")} style={themed($editButtonText)} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={themed($deleteButton)}
              onPress={handleDelete}
              accessibilityLabel={translate("bulletinBoard:actions.deletePost")}
            >
              <Text text="🗑️" style={themed($buttonIcon)} />
              <Text text={translate("bulletinBoard:actions.delete")} style={themed($deleteButtonText)} />
            </TouchableOpacity>
          </View>
        )}

        {/* Application Modal */}
        <Modal
          visible={showApplicationModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowApplicationModal(false)}
        >
          <View style={themed($modalOverlay)}>
            <View style={themed($modalContent)}>
              <View style={themed($modalHeader)}>
                <Text preset="subheading" text="지원하기" style={themed($modalTitle)} />
                <TouchableOpacity 
                  onPress={() => setShowApplicationModal(false)}
                  style={themed($closeButton)}
                >
                  <Text text="✕" style={themed($closeButtonText)} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={themed($modalScrollView)} 
                showsVerticalScrollIndicator={false}
              >
                <Text text={post?.title || ""} style={themed($modalPostTitle)} />
                <Text text={post?.organizationName || ""} style={themed($modalOrgName)} />

                {post?.roles && post.roles.length > 0 && (
                  <View style={themed($rolesSection)}>
                    <Text text="모집 역할:" style={themed($sectionLabel)} />
                    {post.roles.map((role, index) => (
                      <View key={index} style={themed($roleItem)}>
                        <Text text={`• ${role.name} (${role.count}명)`} style={themed($roleItemText)} />
                        <Text text={`  ${role.gender === 'male' ? '남성' : role.gender === 'female' ? '여성' : '성별무관'}, ${role.ageRange}`} style={themed($modalRoleDetailText)} />
                      </View>
                    ))}
                  </View>
                )}

                <TextField
                  label="연락처 *"
                  placeholder="전화번호를 입력해주세요"
                  value={applicationPhoneNumber}
                  onChangeText={setApplicationPhoneNumber}
                  style={themed($formInput)}
                  keyboardType="phone-pad"
                />

                {post?.roles && post.roles.length > 1 && (
                  <TextField
                    label="지원하고자 하는 역할"
                    placeholder="희망하는 역할을 선택하거나 입력해주세요"
                    value={applicationRolePreference}
                    onChangeText={setApplicationRolePreference}
                    style={themed($formInput)}
                  />
                )}

                <TextField
                  label="관련 경력 및 경험"
                  placeholder="연기, 노래, 춤 등 관련 경험을 작성해주세요"
                  value={applicationExperience}
                  onChangeText={setApplicationExperience}
                  multiline
                  numberOfLines={3}
                  style={themed($formInput)}
                />

                <TextField
                  label="지원 동기 및 자기소개"
                  placeholder="지원 동기나 자기소개를 작성해주세요"
                  value={applicationMessage}
                  onChangeText={setApplicationMessage}
                  multiline
                  numberOfLines={4}
                  style={themed($formInput)}
                />
              </ScrollView>

              <View style={themed($modalButtons)}>
                <TouchableOpacity 
                  style={themed($cancelButton)}
                  onPress={() => setShowApplicationModal(false)}
                >
                  <Text text="취소" style={themed($cancelButtonText)} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={themed($submitButton)}
                  onPress={handleApply}
                  disabled={submittingApplication}
                >
                  <Text 
                    text={submittingApplication ? "지원 중..." : "지원하기"} 
                    style={themed($submitButtonText)} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Alert Modal */}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
        dismissable={alertState.dismissable}
      />
    </Screen>
  )
}
