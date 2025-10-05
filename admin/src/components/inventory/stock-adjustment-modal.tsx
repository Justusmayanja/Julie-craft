"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useStockAdjustment } from "@/hooks/use-enhanced-inventory"

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product: {
    id: string
    name: string
    sku: string
    current_quantity: number
    available_quantity?: number
    reserved_quantity?: number
    min_stock_level: number
    max_stock_level: number
    reorder_point: number
  } | null
}

export function StockAdjustmentModal({ isOpen, onClose, onSuccess, product }: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease' | 'set' | 'reserve' | 'unreserve'>('increase')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [reference, setReference] = useState('')
  const [validationError, setValidationError] = useState('')

  const { adjustStock, loading, error } = useStockAdjustment()

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity('')
      setReason('')
      setNotes('')
      setReference('')
      setValidationError('')
    }
  }, [isOpen, product])

  // Auto-suggest adjustment type based on reason
  useEffect(() => {
    if (reason) {
      switch (reason) {
        case 'received':
        case 'return':
          if (adjustmentType === 'decrease' || adjustmentType === 'reserve' || adjustmentType === 'unreserve') {
            setAdjustmentType('increase')
          }
          break
        case 'damaged':
        case 'lost':
        case 'sale':
          if (adjustmentType === 'increase' || adjustmentType === 'reserve' || adjustmentType === 'unreserve') {
            setAdjustmentType('decrease')
          }
          break
        case 'transfer':
          if (adjustmentType === 'increase' || adjustmentType === 'decrease') {
            setAdjustmentType('reserve')
          }
          break
      }
    }
  }, [reason, adjustmentType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product) return

    // Clear previous errors
    setValidationError('')

    // Basic validation
    const quantityNum = parseInt(quantity)
    if (isNaN(quantityNum) || quantityNum < 0) {
      setValidationError('Please enter a valid positive quantity')
      return
    }

    if (!reason) {
      setValidationError('Please select a reason for the adjustment')
      return
    }

    // Business logic validation
    const validationResult = validateStockAdjustment(product, adjustmentType, quantityNum, reason)
    if (!validationResult.isValid) {
      setValidationError(validationResult.error)
      return
    }

    // Calculate new quantity
    const newQuantity = calculateNewQuantity(product.current_quantity, adjustmentType, quantityNum)

    // Additional business rules
    if (adjustmentType === 'decrease' && newQuantity < 0) {
      setValidationError('Cannot decrease stock below zero. Consider using "Set to Specific Value" instead.')
      return
    }

    // Maximum stock level validation removed - allowing unlimited stock levels

    // Map reservation types to existing adjustment types
    let mappedAdjustmentType: 'increase' | 'decrease' | 'set' = adjustmentType as any
    if (adjustmentType === 'reserve') {
      mappedAdjustmentType = 'decrease' // Reserve reduces available stock
    } else if (adjustmentType === 'unreserve') {
      mappedAdjustmentType = 'increase' // Unreserve increases available stock
    }

    // Submit adjustment
    const result = await adjustStock({
      product_id: product.id,
      adjustment_type: mappedAdjustmentType,
      quantity: quantityNum,
      reason: reason as any,
      notes: notes || undefined,
      reference: reference || undefined,
    })

    if (result.success) {
      onSuccess()
      onClose()
    }
  }

  // Enhanced business logic validation
  const validateStockAdjustment = (product: any, type: string, quantity: number, reason: string) => {
    // Check for zero quantity adjustments
    if (quantity === 0 && type !== 'set') {
      return { isValid: false, error: 'Adjustment quantity cannot be zero' }
    }

    // Check for unreasonably large adjustments
    if (quantity > 10000) {
      return { isValid: false, error: 'Adjustment quantity seems unusually large. Please verify the amount.' }
    }

    // Business rules based on reason
    switch (reason) {
      case 'received':
        if (type === 'decrease' || type === 'reserve' || type === 'unreserve') {
          return { isValid: false, error: 'Stock received should be an increase, not a decrease or reservation' }
        }
        break
      case 'damaged':
      case 'lost':
        if (type === 'increase' || type === 'reserve' || type === 'unreserve') {
          return { isValid: false, error: 'Damaged/lost items should decrease stock, not increase or reserve it' }
        }
        break
      case 'sale':
        if (type === 'increase' || type === 'reserve' || type === 'unreserve') {
          return { isValid: false, error: 'Sales should decrease stock, not increase or reserve it' }
        }
        break
      case 'transfer':
        if (type === 'increase' || type === 'decrease') {
          return { isValid: false, error: 'Internal transfers should use reserve/unreserve, not direct stock changes' }
        }
        break
    }

    // Check for potential data entry errors
    if (type === 'set' && quantity === product.current_quantity) {
      return { isValid: false, error: 'New quantity is the same as current quantity. No adjustment needed.' }
    }

    // Check reservation limits
    if (type === 'reserve' && quantity > product.current_quantity) {
      return { isValid: false, error: `Cannot reserve ${quantity} units. Only ${product.current_quantity} units available.` }
    }

    return { isValid: true, error: '' }
  }

  // Enhanced quantity calculation
  const calculateNewQuantity = (current: number, type: string, quantity: number) => {
    switch (type) {
      case 'increase':
        return current + quantity
      case 'decrease':
        return Math.max(0, current - quantity)
      case 'set':
        return quantity
      case 'reserve':
        // Reserving doesn't change total stock, but affects available quantity
        return current
      case 'unreserve':
        // Unreserving doesn't change total stock, but affects available quantity
        return current
      default:
        return current
    }
  }

  // Calculate available quantity after reservation changes
  const calculateAvailableQuantity = (current: number, reserved: number, type: string, quantity: number) => {
    const currentReserved = reserved || 0
    switch (type) {
      case 'reserve':
        return Math.max(0, current - (currentReserved + quantity))
      case 'unreserve':
        return Math.min(current, current - (currentReserved - quantity))
      case 'increase':
        return current + quantity - currentReserved
      case 'decrease':
        return Math.max(0, current - quantity - currentReserved)
      case 'set':
        return quantity - currentReserved
      default:
        return current - currentReserved
    }
  }

  const getNewQuantity = () => {
    if (!product || !quantity) return product?.current_quantity || 0
    
    const quantityNum = parseInt(quantity)
    if (isNaN(quantityNum)) return product.current_quantity

    return calculateNewQuantity(product.current_quantity, adjustmentType, quantityNum)
  }

  const getQuantityChange = () => {
    if (!product || !quantity) return 0
    
    const quantityNum = parseInt(quantity)
    if (isNaN(quantityNum)) return 0

    const newQty = calculateNewQuantity(product.current_quantity, adjustmentType, quantityNum)
    return newQty - product.current_quantity
  }

  const getNewReservedQuantity = () => {
    if (!product || !quantity) return product?.reserved_quantity || 0
    
    const quantityNum = parseInt(quantity)
    if (isNaN(quantityNum)) return product.reserved_quantity || 0

    const currentReserved = product.reserved_quantity || 0
    switch (adjustmentType) {
      case 'reserve':
        return currentReserved + quantityNum
      case 'unreserve':
        return Math.max(0, currentReserved - quantityNum)
      default:
        return currentReserved
    }
  }

  const getNewAvailableQuantity = () => {
    if (!product || !quantity) return product?.available_quantity || 0
    
    const quantityNum = parseInt(quantity)
    if (isNaN(quantityNum)) return product.available_quantity || 0

    return calculateAvailableQuantity(
      product.current_quantity, 
      product.reserved_quantity || 0, 
      adjustmentType, 
      quantityNum
    )
  }

  // Enhanced validation for real-time feedback
  const getValidationWarning = () => {
    if (!product || !quantity) return null
    
    const quantityNum = parseInt(quantity)
    if (isNaN(quantityNum)) return null

    const newQty = calculateNewQuantity(product.current_quantity, adjustmentType, quantityNum)
    const newAvailable = getNewAvailableQuantity()
    
    // Check for reservation-specific warnings
    if (adjustmentType === 'reserve') {
      if (quantityNum > (product.available_quantity || product.current_quantity)) {
        return { type: 'error', message: `Cannot reserve ${quantityNum} units. Only ${product.available_quantity || product.current_quantity} units available.` }
      }
      if (newAvailable <= 0) {
        return { type: 'warning', message: 'All stock will be reserved after this adjustment' }
      }
    }
    
    if (adjustmentType === 'unreserve') {
      if (quantityNum > (product.reserved_quantity || 0)) {
        return { type: 'error', message: `Cannot unreserve ${quantityNum} units. Only ${product.reserved_quantity || 0} units reserved.` }
      }
    }
    
    // Check for low stock warning
    if (newQty > 0 && newQty <= (product.reorder_point || 0)) {
      return { type: 'warning', message: 'Stock will be below reorder point after adjustment' }
    }
    
    // Check for out of stock warning
    if (newQty === 0) {
      return { type: 'error', message: 'Stock will be completely depleted' }
    }
    
    // Maximum stock level warning removed - allowing unlimited stock levels
    
    return null
  }

  const getStatusColor = (newQty: number) => {
    if (!product) return 'text-slate-600'
    if (newQty === 0) return 'text-red-600'
    if (newQty <= (product.min_stock_level || 0)) return 'text-yellow-600'
    if (newQty <= (product.reorder_point || 0)) return 'text-orange-600'
    return 'text-green-600'
  }

  const getStatusText = (newQty: number) => {
    if (!product) return 'Unknown'
    if (newQty === 0) return 'Out of Stock'
    if (newQty <= (product.min_stock_level || 0)) return 'Low Stock'
    if (newQty <= (product.reorder_point || 0)) return 'Below Reorder Point'
    return 'In Stock'
  }

  if (!product) return null

  const newQuantity = getNewQuantity()
  const quantityChange = getQuantityChange()
  const validationWarning = getValidationWarning()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-slate-200/60">
        <DialogHeader className="pb-6 bg-white/90 backdrop-blur-sm rounded-t-xl border-b border-slate-200/60 p-6 -m-6 mb-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            Stock Adjustment
          </DialogTitle>
          <p className="text-slate-600 text-sm font-medium mt-2">Update inventory levels for {product.name}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg">
          {/* Enhanced Product Info */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                <p className="text-slate-600 text-sm font-medium">Product Information</p>
              </div>
              <Badge variant="outline" className="bg-white border-slate-300 text-slate-700 font-semibold px-3 py-1">
                {product.sku}
              </Badge>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Stock</div>
                <div className="text-lg font-bold text-slate-900">{product.current_quantity}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Available</div>
                <div className="text-lg font-bold text-emerald-600">{product.available_quantity || product.current_quantity}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Reserved</div>
                <div className="text-lg font-bold text-purple-600">{product.reserved_quantity || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Reorder Point</div>
                <div className="text-lg font-bold text-slate-900">{product.reorder_point}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 font-medium">
              💡 Maximum stock level constraint removed - unlimited stock levels allowed
            </div>
          </div>

          {/* Enhanced Adjustment Type */}
          <div className="space-y-3">
            <Label htmlFor="adjustment-type" className="text-sm font-semibold text-slate-900">Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
              <SelectTrigger className="bg-white border-slate-300 focus:ring-blue-500/20 focus:border-blue-500 font-medium rounded-lg shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-green-100 rounded-md">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Increase Stock</div>
                      <div className="text-xs text-slate-500">Add inventory to current level</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="decrease">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-red-100 rounded-md">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Decrease Stock</div>
                      <div className="text-xs text-slate-500">Remove inventory from current level</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="set">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-blue-100 rounded-md">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Set to Specific Value</div>
                      <div className="text-xs text-slate-500">Set exact inventory quantity</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="reserve">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-purple-100 rounded-md">
                      <Package className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Reserve Stock</div>
                      <div className="text-xs text-slate-500">Reserve quantity for future use</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="unreserve">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-cyan-100 rounded-md">
                      <Package className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Unreserve Stock</div>
                      <div className="text-xs text-slate-500">Release reserved quantity back to available</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Quantity Input */}
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-semibold text-slate-900">
              {adjustmentType === 'set' ? 'New Quantity' : 
               adjustmentType === 'reserve' ? 'Quantity to Reserve' :
               adjustmentType === 'unreserve' ? 'Quantity to Unreserve' :
               'Quantity to Adjust'}
            </Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={
                  adjustmentType === 'set' ? 'Enter new quantity' : 
                  adjustmentType === 'reserve' ? 'Enter quantity to reserve' :
                  adjustmentType === 'unreserve' ? 'Enter quantity to unreserve' :
                  'Enter quantity'
                }
                className="bg-white border-slate-300 focus:ring-blue-500/20 focus:border-blue-500 font-medium rounded-lg shadow-sm pl-4 pr-12 text-slate-900 placeholder-slate-500"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">
                units
              </div>
            </div>
            {adjustmentType !== 'set' && (
              <p className="text-xs text-slate-500 font-medium">
                {adjustmentType === 'increase' 
                  ? `Will add to current stock of ${product.current_quantity} (unlimited capacity)`
                  : adjustmentType === 'decrease'
                  ? `Will subtract from current stock of ${product.current_quantity}`
                  : adjustmentType === 'reserve'
                  ? `Will reserve from available stock (${product.available_quantity || product.current_quantity} available)`
                  : adjustmentType === 'unreserve'
                  ? `Will unreserve from reserved stock (${product.reserved_quantity || 0} reserved)`
                  : `Will adjust current stock of ${product.current_quantity}`
                }
              </p>
            )}
          </div>

          {/* Enhanced Preview */}
          {quantity && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-blue-100 rounded-md">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-bold text-blue-900 text-base">Adjustment Preview</h4>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-3 rounded-lg border border-blue-200/60">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Current Stock</div>
                  <div className="text-lg font-bold text-slate-900">{product.current_quantity}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200/60">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Change</div>
                  <div className={`text-lg font-bold ${quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {quantityChange >= 0 ? '+' : ''}{quantityChange}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200/60">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">New Stock</div>
                  <div className={`text-lg font-bold ${getStatusColor(newQuantity)}`}>
                    {newQuantity}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200/60">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Reserved</div>
                  <div className="text-lg font-bold text-purple-600">
                    {getNewReservedQuantity()}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200/60">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Available</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {getNewAvailableQuantity()}
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-white p-3 rounded-lg border border-blue-200/60">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Status</div>
                <div className={`text-sm font-bold ${getStatusColor(newQuantity)}`}>
                  {getStatusText(newQuantity)}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Validation Warning */}
          {validationWarning && (
            <Alert className={`border-2 ${
              validationWarning.type === 'error' 
                ? 'border-red-200 bg-red-50' 
                : 'border-amber-200 bg-amber-50'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                validationWarning.type === 'error' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <AlertDescription className={`font-medium ${
                validationWarning.type === 'error' ? 'text-red-800' : 'text-amber-800'
              }`}>
                {validationWarning.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Reason Selection */}
          <div className="space-y-3">
            <Label htmlFor="reason" className="text-sm font-semibold text-slate-900">Reason for Adjustment</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-white border-slate-300 focus:ring-blue-500/20 focus:border-blue-500 font-medium rounded-lg shadow-sm">
                <SelectValue placeholder="Select a reason for this adjustment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="received">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-green-100 rounded-md">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Stock Received</div>
                      <div className="text-xs text-slate-500">New inventory received from supplier</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="damaged">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-red-100 rounded-md">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Damaged Goods</div>
                      <div className="text-xs text-slate-500">Items damaged and removed from stock</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="lost">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-orange-100 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Lost/Stolen</div>
                      <div className="text-xs text-slate-500">Items lost or stolen from inventory</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="correction">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-blue-100 rounded-md">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Inventory Correction</div>
                      <div className="text-xs text-slate-500">Correcting inventory discrepancies</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="return">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-purple-100 rounded-md">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Customer Return</div>
                      <div className="text-xs text-slate-500">Items returned by customers</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="sale">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-indigo-100 rounded-md">
                      <TrendingDown className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Sale/Transfer</div>
                      <div className="text-xs text-slate-500">Items sold or transferred out</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="transfer">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-cyan-100 rounded-md">
                      <Package className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Internal Transfer</div>
                      <div className="text-xs text-slate-500">Moving items between locations</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-slate-100 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Other</div>
                      <div className="text-xs text-slate-500">Other reason not listed above</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Reference and Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="reference" className="text-sm font-semibold text-slate-900">Reference (Optional)</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="PO number, invoice, etc."
                className="bg-white border-slate-300 focus:ring-blue-500/20 focus:border-blue-500 font-medium rounded-lg shadow-sm text-slate-900 placeholder-slate-500"
              />
              <p className="text-xs text-slate-500 font-medium">Reference number for tracking purposes</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-900">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this adjustment"
                rows={3}
                className="bg-white border-slate-300 focus:ring-blue-500/20 focus:border-blue-500 font-medium rounded-lg shadow-sm resize-none text-slate-900 placeholder-slate-500"
              />
              <p className="text-xs text-slate-500 font-medium">Additional context or details</p>
            </div>
          </div>

          {/* Enhanced Error Display */}
          {(validationError || error) && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                {validationError || error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-6 border-t border-slate-200/60 bg-white/90 backdrop-blur-sm rounded-b-xl p-6 -m-6 mt-6">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500 font-medium">
                This adjustment will be logged in the inventory history
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={loading}
                  className="bg-white hover:bg-slate-50 border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Adjust Stock
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
