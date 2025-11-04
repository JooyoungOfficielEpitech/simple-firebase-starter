import { View } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { ContactInfo } from "@/types/post" // ContactInfo
import {
  $section,
  $sectionTitle,
  $contactCard,
  $contactRow,
  $contactIcon,
  $contactContent,
  $contactLabel,
  $contactText,
  $contactValue,
  $documentsSection,
  $documentsList,
  $documentItem,
  $bulletPoint,
  $documentText,
} from "@/screens/PostDetailScreen.styles"

interface ContactCardProps {
  contact: ContactInfo | undefined
}

export const ContactCard = ({ contact }: ContactCardProps) => {
  const { themed } = useAppTheme()

  if (!contact) return null

  return (
    <View style={themed($section)}>
      <Text preset="subheading" text="연락처 정보" style={themed($sectionTitle)} />
      <View style={themed($contactCard)}>
        <View style={themed($contactRow)}>
          <Text text="📧" style={themed($contactIcon)} />
          <View style={themed($contactContent)}>
            <Text text="담당자 이메일" style={themed($contactLabel)} />
            <Text text={contact.email} style={themed($contactText) as any} />
          </View>
        </View>
        
        {contact.phone && (
          <View style={themed($contactRow)}>
            <Text text="📞" style={themed($contactIcon)} />
            <View style={themed($contactContent)}>
              <Text text="연락처" style={themed($contactLabel)} />
              <Text text={contact.phone} style={themed($contactValue)} />
            </View>
          </View>
        )}

        {contact.applicationMethod && (
          <View style={themed($contactRow)}>
            <Text text="📝" style={themed($contactIcon)} />
            <View style={themed($contactContent)}>
              <Text text="지원 방법" style={themed($contactLabel)} />
              <Text text={contact.applicationMethod} style={themed($contactValue)} />
            </View>
          </View>
        )}

        {contact.requiredDocuments && contact.requiredDocuments.length > 0 && (
          <View style={themed($documentsSection)}>
            <View style={themed($contactRow)}>
              <Text text="📄" style={themed($contactIcon)} />
              <View style={themed($contactContent)}>
                <Text text="제출 서류" style={themed($contactLabel)} />
                <View style={themed($documentsList)}>
                  {contact.requiredDocuments.map((document, index) => (
                    <View key={index} style={themed($documentItem)}>
                      <Text text="•" style={themed($bulletPoint)} />
                      <Text text={document} style={themed($documentText)} />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
