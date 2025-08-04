#!/usr/bin/env ruby
require 'xcodeproj'

# Open the Xcode project file
project_path = 'ios/designaiapp.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find or create the top-level "designaiapp" group
main_group = project.main_group.find_subpath('designaiapp', true)

# Add the StoreKit file reference (make sure this path matches your file)
file_ref = main_group.new_file('ios/Products.storekit')

# Attach that file into the "Resources" phase of the designaiapp target
project.targets.each do |t|
  if t.name == 'designaiapp'
    t.resources_build_phase.add_file_reference(file_ref)
  end
end

# Save and close the project
project.save
puts "✅ Successfully injected Products.storekit into #{project_path}"
