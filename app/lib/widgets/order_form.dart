import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../config/constants.dart';

class OrderForm extends StatefulWidget {
  final bool isBuy;
  final String coinSymbol;
  final double currentPrice;
  final bool showLeverage;
  final Function(Map<String, dynamic>)? onSubmit;

  const OrderForm({
    super.key,
    required this.isBuy,
    required this.coinSymbol,
    required this.currentPrice,
    this.showLeverage = false,
    this.onSubmit,
  });

  @override
  State<OrderForm> createState() => _OrderFormState();
}

class _OrderFormState extends State<OrderForm> {
  final _priceController = TextEditingController();
  final _amountController = TextEditingController();
  double _sliderValue = 0;
  int _leverage = 1;
  String _orderType = 'Limit';

  @override
  void initState() {
    super.initState();
    _priceController.text = widget.currentPrice.toStringAsFixed(2);
  }

  @override
  void didUpdateWidget(OrderForm oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentPrice != widget.currentPrice) {
      _priceController.text = widget.currentPrice.toStringAsFixed(2);
    }
  }

  @override
  void dispose() {
    _priceController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  double get _total {
    final price = double.tryParse(_priceController.text) ?? 0;
    final amount = double.tryParse(_amountController.text) ?? 0;
    return price * amount;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Order type selector
        Row(
          children: [
            const Text(
              'Order Type:',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
            const SizedBox(width: 8),
            ...['Market', 'Limit'].map(
              (type) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(type, style: const TextStyle(fontSize: 12)),
                  selected: _orderType == type,
                  selectedColor: AppTheme.gold,
                  onSelected: (selected) {
                    if (selected) setState(() => _orderType = type);
                  },
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Price input
        if (_orderType != 'Market')
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Price (USDT)',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _priceController,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 15),
                decoration: InputDecoration(
                  suffixText: 'USDT',
                  suffixStyle: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 13,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 12),
            ],
          ),

        // Amount input
        const Text(
          'Amount',
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _amountController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: const TextStyle(fontSize: 15),
          decoration: InputDecoration(
            suffixText: widget.coinSymbol,
            suffixStyle: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 13,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 10,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 8),

        // Amount slider
        Slider(
          value: _sliderValue,
          min: 0,
          max: 100,
          divisions: 4,
          activeColor: widget.isBuy ? AppTheme.greenUp : AppTheme.redDown,
          inactiveColor: AppTheme.darkSurface,
          label: '${_sliderValue.toInt()}%',
          onChanged: (value) {
            setState(() {
              _sliderValue = value;
              final maxAmount = 10000 / widget.currentPrice;
              _amountController.text =
                  (maxAmount * value / 100).toStringAsFixed(6);
            });
          },
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: ['0%', '25%', '50%', '75%', '100%']
              .map((label) => Text(
                    label,
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 11,
                    ),
                  ))
              .toList(),
        ),
        const SizedBox(height: 12),

        // Leverage selector
        if (widget.showLeverage) ...[
          Row(
            children: [
              const Text(
                'Leverage:',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonFormField<int>(
                  value: _leverage,
                  dropdownColor: AppTheme.darkCard,
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                  items: AppConstants.leverageOptions
                      .map(
                        (l) => DropdownMenuItem(
                          value: l,
                          child: Text('${l}x'),
                        ),
                      )
                      .toList(),
                  onChanged: (v) =>
                      setState(() => _leverage = v ?? _leverage),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
        ],

        // Total
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Total',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
            ),
            Text(
              '\$${_total.toStringAsFixed(2)} USDT',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Submit button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  widget.isBuy ? AppTheme.greenUp : AppTheme.redDown,
            ),
            onPressed: () {
              widget.onSubmit?.call({
                'coinSymbol': widget.coinSymbol,
                'orderType': _orderType,
                'side': widget.isBuy ? 'buy' : 'sell',
                'price': double.tryParse(_priceController.text) ?? 0,
                'amount': double.tryParse(_amountController.text) ?? 0,
                'leverage': _leverage,
              });
            },
            child: Text(
              '${widget.isBuy ? "BUY" : "SELL"} ${widget.coinSymbol}',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
