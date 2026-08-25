-- Clean up duplicate wallets with different cases
-- Merge lowercase coin wallets into uppercase ones

DO $$
DECLARE
    wallet_record RECORD;
    upper_wallet_id UUID;
BEGIN
    -- Find all lowercase coin wallets
    FOR wallet_record IN 
        SELECT id, user_id, coin, wallet_type, balance, frozen_balance
        FROM wallets 
        WHERE coin != UPPER(coin)
    LOOP
        -- Check if uppercase version exists
        SELECT id INTO upper_wallet_id
        FROM wallets
        WHERE user_id = wallet_record.user_id
          AND coin = UPPER(wallet_record.coin)
          AND wallet_type = wallet_record.wallet_type;
        
        IF FOUND THEN
            -- Merge balances into uppercase wallet
            UPDATE wallets
            SET balance = balance + wallet_record.balance,
                frozen_balance = frozen_balance + wallet_record.frozen_balance,
                updated_at = NOW()
            WHERE id = upper_wallet_id;
            
            -- Delete lowercase wallet
            DELETE FROM wallets WHERE id = wallet_record.id;
            
            RAISE NOTICE 'Merged % wallet for user %', wallet_record.coin, wallet_record.user_id;
        ELSE
            -- Just uppercase the coin name
            UPDATE wallets
            SET coin = UPPER(coin)
            WHERE id = wallet_record.id;
            
            RAISE NOTICE 'Uppercased % to % for user %', wallet_record.coin, UPPER(wallet_record.coin), wallet_record.user_id;
        END IF;
    END LOOP;
END $$;

-- Verify
SELECT 'Cleanup completed!' as status;
SELECT coin, wallet_type, COUNT(*) as count FROM wallets GROUP BY coin, wallet_type ORDER BY coin, wallet_type;
