import type {
  CreatePromotionRuleDTO,
  IPromotionModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

type RuleInput = {
  promotionId: string
  oldRuleIds: string[]
  oldRules: CreatePromotionRuleDTO[]
  newRules: CreatePromotionRuleDTO[]
}

const replaceAffiliatePromotionRulesStep = createStep(
  "replace-affiliate-promotion-rules",
  async (input: RuleInput, { container }) => {
    const service = container.resolve<IPromotionModuleService>(Modules.PROMOTION)
    if (input.oldRuleIds.length) {
      await service.removePromotionRules(input.promotionId, input.oldRuleIds)
    }
    try {
      const created = input.newRules.length
        ? await service.addPromotionRules(input.promotionId, input.newRules)
        : []
      return new StepResponse(null, {
        promotionId: input.promotionId,
        createdRuleIds: created.map((rule) => rule.id),
        oldRules: input.oldRules,
      })
    } catch (error) {
      if (input.oldRules.length) {
        await service.addPromotionRules(input.promotionId, input.oldRules)
      }
      throw error
    }
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const service = container.resolve<IPromotionModuleService>(Modules.PROMOTION)
    if (compensation.createdRuleIds.length) {
      await service.removePromotionRules(
        compensation.promotionId,
        compensation.createdRuleIds
      )
    }
    if (compensation.oldRules.length) {
      await service.addPromotionRules(
        compensation.promotionId,
        compensation.oldRules
      )
    }
  }
)

export const syncAffiliatePromotionRulesWorkflow = createWorkflow(
  "sync-affiliate-promotion-rules",
  (input: RuleInput) => {
    replaceAffiliatePromotionRulesStep(input)
    return new WorkflowResponse(null)
  }
)
