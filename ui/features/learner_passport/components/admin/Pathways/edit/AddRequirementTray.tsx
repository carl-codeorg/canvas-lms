/*
 * Copyright (C) 2023 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useCallback, useState} from 'react'
import {Button, CloseButton} from '@instructure/ui-buttons'
import {Checkbox} from '@instructure/ui-checkbox'
import {Flex} from '@instructure/ui-flex'
import {Heading} from '@instructure/ui-heading'
import {SimpleSelect} from '@instructure/ui-simple-select'
import {TextArea} from '@instructure/ui-text-area'
import {TextInput} from '@instructure/ui-text-input'
import {Tooltip} from '@instructure/ui-tooltip'
import {Tray} from '@instructure/ui-tray'
import {View} from '@instructure/ui-view'
import {uid} from '@instructure/uid'
import type {
  CanvasRequirementSearchResultType,
  CanvasRequirementType,
  RequirementData,
  RequirementType,
} from '../../../types'
import {RequirementTypes, CanvasRequirementTypes} from '../../../types'
import CanvasRequirement from './requirements/CanvasRequirement'
import NotImplementedRequirements from './requirements/NotImplementedRequirements'

type RequirementTrayProps = {
  requirement?: RequirementData
  open: boolean
  variant: 'add' | 'edit'
  onClose: () => void
  onSave: (requirement: RequirementData) => void
}

const RequirementTray = ({requirement, open, variant, onClose, onSave}: RequirementTrayProps) => {
  const [requirementId] = useState(requirement?.id || uid('req', 3))
  const [name, setName] = useState(requirement?.name || '')
  const [description, setDescription] = useState(requirement?.description || '')
  const [required, setRequired] = useState<boolean>(requirement?.required || true)
  const [type, setType] = useState<RequirementType | null>(requirement?.type || null)
  const [canvasContent, setCanvasContent] = useState<CanvasRequirementSearchResultType | undefined>(
    requirement?.canvas_content
  )

  const isValid = useCallback(() => {
    return name && type
  }, [name, type])

  const handleSave = useCallback(() => {
    if (!isValid()) return

    const newRequirement = {
      id: requirementId,
      name,
      description,
      required,
      type: type as RequirementType,
      canvas_content: canvasContent,
    }
    onSave(newRequirement)
  }, [canvasContent, description, isValid, name, onSave, required, requirementId, type])

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, newName: string) => {
      setName(newName)
    },
    []
  )

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = event.target.value
    setDescription(newDescription)
  }, [])

  const handleOptionalCheck = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRequired(!event.target.checked)
  }, [])

  const handleTypeChange = useCallback((event: React.SyntheticEvent<Element, Event>, {value}) => {
    setType(value as RequirementType)
  }, [])

  const handleCanvasRequirementChange = useCallback(
    (canvasRequirement: CanvasRequirementSearchResultType | undefined) => {
      setCanvasContent(canvasRequirement)
    },
    []
  )

  const renderRequirementPicker = useCallback(() => {
    if (!type) return
    if (Object.keys(CanvasRequirementTypes).includes(type)) {
      return (
        <CanvasRequirement
          type={type as CanvasRequirementType}
          onChange={handleCanvasRequirementChange}
        />
      )
    }
    return <NotImplementedRequirements />
  }, [handleCanvasRequirementChange, type])

  return (
    <View as="div">
      <Tray
        label={variant === 'add' ? 'Add Requirement' : 'Edit Requirement'}
        open={open}
        onDismiss={onClose}
        size="regular"
        placement="end"
      >
        <Flex as="div" direction="column" height="100vh">
          <Flex as="div" padding="small small small medium">
            <Flex.Item shouldGrow={true} shouldShrink={true}>
              <Heading level="h2" margin="0 0 small 0">
                {variant === 'add' ? 'Add Requirement' : 'Edit Requirement'}
              </Heading>
            </Flex.Item>
            <Flex.Item>
              <CloseButton
                placement="end"
                offset="small"
                screenReaderLabel="Close"
                onClick={onClose}
              />
            </Flex.Item>
          </Flex>
          <Flex.Item shouldGrow={true}>
            <View as="div" padding="medium">
              <View as="div" padding="0 0 medium 0" borderWidth="0 0 small 0">
                <View as="div" margin="0 0 small 0">
                  <TextInput
                    renderLabel="Name"
                    isRequired={true}
                    value={name}
                    onChange={handleNameChange}
                  />
                </View>
                <View as="div" margin="0 0 small 0">
                  <TextArea
                    label="Description"
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </View>
                <View as="div" margin="0 0 small 0">
                  <Checkbox
                    label="Mark requirement as optional"
                    value="optional"
                    size="small"
                    checked={!required}
                    variant="toggle"
                    onChange={handleOptionalCheck}
                  />
                </View>

                <View as="div" padding="large 0 small 0">
                  <SimpleSelect
                    isRequired={true}
                    placeholder="Select a type"
                    renderLabel="Requirement type"
                    defaultValue=""
                    value={type || undefined}
                    onChange={handleTypeChange}
                  >
                    {Object.keys(RequirementTypes).map(key => {
                      const reqtype = key as RequirementType
                      return (
                        <SimpleSelect.Option key={reqtype} id={reqtype} value={reqtype}>
                          {RequirementTypes[reqtype]}
                        </SimpleSelect.Option>
                      )
                    })}
                  </SimpleSelect>
                </View>
              </View>
              {renderRequirementPicker()}
            </View>
          </Flex.Item>
          <Flex.Item align="end" width="100%">
            <View as="div" padding="small medium" borderWidth="small 0 0 0" textAlign="end">
              <Button onClick={onClose}>Cancel</Button>
              <Tooltip
                renderTip="You must provide a name and type before saving."
                on={isValid() ? [] : ['click', 'hover', 'focus']}
              >
                <Button margin="0 0 0 small" onClick={handleSave}>
                  Save Requirement
                </Button>
              </Tooltip>
            </View>
          </Flex.Item>
        </Flex>
      </Tray>
    </View>
  )
}

export default RequirementTray
