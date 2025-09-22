import { validateEmail, validatePassword, validatePostData, validateUserInput } from "../validation"

describe("Validation Utils", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "firstname+lastname@domain.com",
        "email@123.123.123.123", // IP address
        "1234567890@example.com",
        "email@domain-one.com",
        "_______@example.com",
        "user@[IPv6:2001:db8::1]",
      ]

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true)
      })
    })

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "",
        "plainaddress",
        "@missinglocalpart.com",
        "missing-at-sign.net",
        "missing@.com",
        "missing@domain",
        "two@@domain.com",
        "trailing.dot@domain.com.",
        "spaces in@email.com",
        "unicode®@domain.com",
      ]

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false)
      })
    })
  })

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const validPasswords = [
        "Password123!",
        "MyStr0ng#Password",
        "Complex1$Password",
        "Valid123@Pass",
      ]

      validPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it("should reject passwords that are too short", () => {
      const result = validatePassword("Short1!")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must be at least 8 characters long")
    })

    it("should reject passwords without uppercase letters", () => {
      const result = validatePassword("password123!")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one uppercase letter")
    })

    it("should reject passwords without lowercase letters", () => {
      const result = validatePassword("PASSWORD123!")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one lowercase letter")
    })

    it("should reject passwords without numbers", () => {
      const result = validatePassword("Password!")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one number")
    })

    it("should reject passwords without special characters", () => {
      const result = validatePassword("Password123")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one special character")
    })

    it("should return multiple errors for weak passwords", () => {
      const result = validatePassword("weak")
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe("validatePostData", () => {
    const validPostData = {
      title: "Valid Post Title",
      description: "This is a valid description with enough content to meet requirements.",
      production: "Valid Production",
      location: "Valid Location",
      organizationName: "Valid Organization",
      tags: ["valid", "tags"],
    }

    it("should validate correct post data", () => {
      const result = validatePostData(validPostData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject empty title", () => {
      const result = validatePostData({ ...validPostData, title: "" })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Title is required")
    })

    it("should reject title that is too long", () => {
      const longTitle = "A".repeat(201)
      const result = validatePostData({ ...validPostData, title: longTitle })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Title must be less than 200 characters")
    })

    it("should reject empty description", () => {
      const result = validatePostData({ ...validPostData, description: "" })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Description is required")
    })

    it("should reject description that is too short", () => {
      const shortDescription = "Too short"
      const result = validatePostData({ ...validPostData, description: shortDescription })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Description must be at least 20 characters")
    })

    it("should reject description that is too long", () => {
      const longDescription = "A".repeat(5001)
      const result = validatePostData({ ...validPostData, description: longDescription })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Description must be less than 5000 characters")
    })

    it("should reject empty production", () => {
      const result = validatePostData({ ...validPostData, production: "" })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Production name is required")
    })

    it("should reject empty location", () => {
      const result = validatePostData({ ...validPostData, location: "" })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Location is required")
    })

    it("should reject empty organization name", () => {
      const result = validatePostData({ ...validPostData, organizationName: "" })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Organization name is required")
    })

    it("should reject too many tags", () => {
      const tooManyTags = Array(11).fill("tag")
      const result = validatePostData({ ...validPostData, tags: tooManyTags })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Cannot have more than 10 tags")
    })

    it("should reject empty tags array", () => {
      const result = validatePostData({ ...validPostData, tags: [] })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("At least one tag is required")
    })
  })

  describe("validateUserInput", () => {
    it("should sanitize HTML and script tags", () => {
      const maliciousInput = "<script>alert('xss')</script>Hello <b>World</b>"
      const sanitized = validateUserInput(maliciousInput)
      expect(sanitized).not.toContain("<script>")
      expect(sanitized).not.toContain("alert")
      expect(sanitized).toContain("Hello")
    })

    it("should trim whitespace", () => {
      const inputWithSpaces = "  Hello World  "
      const sanitized = validateUserInput(inputWithSpaces)
      expect(sanitized).toBe("Hello World")
    })

    it("should handle empty input", () => {
      expect(validateUserInput("")).toBe("")
      expect(validateUserInput("   ")).toBe("")
    })

    it("should preserve safe content", () => {
      const safeInput = "This is safe content with numbers 123 and symbols !@#"
      const sanitized = validateUserInput(safeInput)
      expect(sanitized).toBe(safeInput)
    })

    it("should handle null and undefined", () => {
      expect(validateUserInput(null as any)).toBe("")
      expect(validateUserInput(undefined as any)).toBe("")
    })
  })
})