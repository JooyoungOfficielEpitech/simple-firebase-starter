#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate UUID (Xcode style)
function generateUUID() {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
}

const projectPath = path.join(__dirname, 'ios/simplefirebasestarter.xcodeproj/project.pbxproj');
let projectContent = fs.readFileSync(projectPath, 'utf8');

// UUIDs for new files
const swiftFileRefUUID = generateUUID();
const swiftBuildFileUUID = generateUUID();
const mFileRefUUID = generateUUID();
const mBuildFileUUID = generateUUID();

console.log('🔧 Adding RNPitchShifter files to Xcode project...');
console.log(`Swift file UUID: ${swiftFileRefUUID}`);
console.log(`M file UUID: ${mFileRefUUID}`);

// Check if files are already added
if (projectContent.includes('RNPitchShifter.swift')) {
  console.log('✅ Files already exist in project');
  process.exit(0);
}

// Find the simplefirebasestarter group UUID
const groupMatch = projectContent.match(/\/\* simplefirebasestarter \*\/ = \{[^}]*isa = PBXGroup;[^}]*children = \(([^)]*)\)/);
if (!groupMatch) {
  console.error('❌ Could not find simplefirebasestarter group');
  process.exit(1);
}

const groupChildren = groupMatch[1];
const groupUUID = projectContent.match(/([A-F0-9]{24}) \/\* simplefirebasestarter \*\/ = \{/)[1];

// Find PBXBuildFile section
const buildFileSection = projectContent.match(/(\/\* Begin PBXBuildFile section \*\/.*?\/\* End PBXBuildFile section \*\/)/s);
if (!buildFileSection) {
  console.error('❌ Could not find PBXBuildFile section');
  process.exit(1);
}

// Find PBXFileReference section
const fileRefSection = projectContent.match(/(\/\* Begin PBXFileReference section \*\/.*?\/\* End PBXFileReference section \*\/)/s);
if (!fileRefSection) {
  console.error('❌ Could not find PBXFileReference section');
  process.exit(1);
}

// Find PBXSourcesBuildPhase
const sourcesBuildMatch = projectContent.match(/([A-F0-9]{24}) \/\* Sources \*\/ = \{[^}]*isa = PBXSourcesBuildPhase;[^}]*files = \(([^)]*)\)/s);
if (!sourcesBuildMatch) {
  console.error('❌ Could not find PBXSourcesBuildPhase');
  process.exit(1);
}

const sourcesBuildPhaseUUID = sourcesBuildMatch[1];
const sourcesBuildFiles = sourcesBuildMatch[2];

// Add PBXBuildFile entries
const buildFileEntries = `${swiftBuildFileUUID} /* RNPitchShifter.swift in Sources */ = {isa = PBXBuildFile; fileRef = ${swiftFileRefUUID} /* RNPitchShifter.swift */; };
\t\t${mBuildFileUUID} /* RNPitchShifter.m in Sources */ = {isa = PBXBuildFile; fileRef = ${mFileRefUUID} /* RNPitchShifter.m */; };
\t\t`;

projectContent = projectContent.replace(
  '/* Begin PBXBuildFile section */',
  `/* Begin PBXBuildFile section */
\t\t${buildFileEntries}`
);

// Add PBXFileReference entries
const fileRefEntries = `${swiftFileRefUUID} /* RNPitchShifter.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = RNPitchShifter.swift; sourceTree = "<group>"; };
\t\t${mFileRefUUID} /* RNPitchShifter.m */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.c.objc; path = RNPitchShifter.m; sourceTree = "<group>"; };
\t\t`;

projectContent = projectContent.replace(
  '/* Begin PBXFileReference section */',
  `/* Begin PBXFileReference section */
\t\t${fileRefEntries}`
);

// Add to group children
const newGroupChildren = groupChildren.trim() + `\n\t\t\t\t${swiftFileRefUUID} /* RNPitchShifter.swift */,\n\t\t\t\t${mFileRefUUID} /* RNPitchShifter.m */,\n\t\t\t`;
projectContent = projectContent.replace(
  new RegExp(`(${groupUUID} /\\* simplefirebasestarter \\*/ = \\{[^}]*children = \\()([^)]*)\\)`, 's'),
  `$1${newGroupChildren})`
);

// Add to Sources build phase
const newSourcesBuildFiles = sourcesBuildFiles.trim() + `\n\t\t\t\t${swiftBuildFileUUID} /* RNPitchShifter.swift in Sources */,\n\t\t\t\t${mBuildFileUUID} /* RNPitchShifter.m in Sources */,\n\t\t\t`;
projectContent = projectContent.replace(
  new RegExp(`(${sourcesBuildPhaseUUID} /\\* Sources \\*/ = \\{[^}]*files = \\()([^)]*)\\)`, 's'),
  `$1${newSourcesBuildFiles})`
);

// Write back
fs.writeFileSync(projectPath, projectContent, 'utf8');

console.log('✅ Successfully added RNPitchShifter files to Xcode project');
console.log('🔨 Now rebuilding the app...');
