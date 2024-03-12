package utils

import (
	"context"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/PeerDB-io/peer-flow/connectors/utils"
	"github.com/PeerDB-io/peer-flow/generated/protos"
	"github.com/PeerDB-io/peer-flow/peerdbenv"
)

var (
	poolMutex = &sync.Mutex{}
	pool      *pgxpool.Pool
)

func GetCatalogConnectionPoolFromEnv(ctx context.Context) (*pgxpool.Pool, error) {
	var err error

	poolMutex.Lock()
	defer poolMutex.Unlock()
	if pool == nil {
		catalogConnectionString := GetCatalogConnectionStringFromEnv()
		pool, err = pgxpool.New(ctx, catalogConnectionString)
		if err != nil {
			return nil, fmt.Errorf("unable to establish connection with catalog: %w", err)
		}
	}

	err = pool.Ping(ctx)
	if err != nil {
		return pool, fmt.Errorf("unable to establish connection with catalog: %w", err)
	}

	return pool, nil
}

func GetCatalogConnectionStringFromEnv() string {
	return utils.GetPGConnectionString(GetCatalogPostgresConfigFromEnv())
}

func GetCatalogPostgresConfigFromEnv() *protos.PostgresConfig {
	return &protos.PostgresConfig{
		Host:     peerdbenv.PeerDBCatalogHost(),
		Port:     uint32(peerdbenv.PeerDBCatalogPort()),
		User:     peerdbenv.PeerDBCatalogUser(),
		Password: peerdbenv.PeerDBCatalogPassword(),
		Database: peerdbenv.PeerDBCatalogDatabase(),
	}
}
