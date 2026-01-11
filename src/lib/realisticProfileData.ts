// Realistic flame graph data simulating a web application request
// ~60 unique functions with multiple call paths and a hidden bottleneck

import type { FlameNode } from './flameGraphData'

// Story: A web request handler that processes user data
// Hidden bottleneck: formatLog() is called from many places and accounts for 15% of runtime
// This teaches: zoom to explore, search to find patterns, discovery of unexpected bottlenecks

export const realisticProfileData: FlameNode = {
  name: 'main',
  value: 1000,
  selfValue: 0,
  children: [
    {
      name: 'Server.handleRequest',
      value: 1000,
      selfValue: 5,
      children: [
        {
          name: 'Middleware.authenticate',
          value: 120,
          selfValue: 10,
          children: [
            {
              name: 'JWT.verify',
              value: 45,
              selfValue: 30,
              children: [
                {
                  name: 'crypto.verify',
                  value: 15,
                  selfValue: 15,
                },
              ],
            },
            {
              name: 'Session.lookup',
              value: 35,
              selfValue: 5,
              children: [
                {
                  name: 'Redis.get',
                  value: 25,
                  selfValue: 25,
                },
                {
                  name: 'formatLog',
                  value: 5,
                  selfValue: 5,
                },
              ],
            },
            {
              name: 'formatLog',
              value: 30,
              selfValue: 30,
            },
          ],
        },
        {
          name: 'Router.match',
          value: 25,
          selfValue: 15,
          children: [
            {
              name: 'RegExp.exec',
              value: 10,
              selfValue: 10,
            },
          ],
        },
        {
          name: 'Controller.userProfile',
          value: 650,
          selfValue: 10,
          children: [
            {
              name: 'Request.parseBody',
              value: 80,
              selfValue: 5,
              children: [
                {
                  name: 'JSON.parse',
                  value: 45,
                  selfValue: 45,
                },
                {
                  name: 'Validator.schema',
                  value: 30,
                  selfValue: 20,
                  children: [
                    {
                      name: 'formatLog',
                      value: 10,
                      selfValue: 10,
                    },
                  ],
                },
              ],
            },
            {
              name: 'Database.query',
              value: 280,
              selfValue: 15,
              children: [
                {
                  name: 'ConnectionPool.acquire',
                  value: 20,
                  selfValue: 20,
                },
                {
                  name: 'Query.build',
                  value: 45,
                  selfValue: 25,
                  children: [
                    {
                      name: 'Query.sanitize',
                      value: 20,
                      selfValue: 20,
                    },
                  ],
                },
                {
                  name: 'Query.execute',
                  value: 150,
                  selfValue: 150,
                },
                {
                  name: 'ResultSet.hydrate',
                  value: 50,
                  selfValue: 30,
                  children: [
                    {
                      name: 'Model.create',
                      value: 20,
                      selfValue: 20,
                    },
                  ],
                },
              ],
            },
            {
              name: 'UserService.transform',
              value: 180,
              selfValue: 15,
              children: [
                {
                  name: 'User.serialize',
                  value: 40,
                  selfValue: 25,
                  children: [
                    {
                      name: 'Date.format',
                      value: 15,
                      selfValue: 15,
                    },
                  ],
                },
                {
                  name: 'Permissions.check',
                  value: 55,
                  selfValue: 20,
                  children: [
                    {
                      name: 'RBAC.evaluate',
                      value: 25,
                      selfValue: 25,
                    },
                    {
                      name: 'formatLog',
                      value: 10,
                      selfValue: 10,
                    },
                  ],
                },
                {
                  name: 'Avatar.resize',
                  value: 70,
                  selfValue: 45,
                  children: [
                    {
                      name: 'Image.decode',
                      value: 15,
                      selfValue: 15,
                    },
                    {
                      name: 'formatLog',
                      value: 10,
                      selfValue: 10,
                    },
                  ],
                },
              ],
            },
            {
              name: 'Cache.set',
              value: 100,
              selfValue: 10,
              children: [
                {
                  name: 'Serializer.encode',
                  value: 35,
                  selfValue: 35,
                },
                {
                  name: 'Redis.set',
                  value: 40,
                  selfValue: 40,
                },
                {
                  name: 'formatLog',
                  value: 15,
                  selfValue: 15,
                },
              ],
            },
          ],
        },
        {
          name: 'Response.send',
          value: 200,
          selfValue: 20,
          children: [
            {
              name: 'Template.render',
              value: 90,
              selfValue: 30,
              children: [
                {
                  name: 'Template.compile',
                  value: 25,
                  selfValue: 25,
                },
                {
                  name: 'Template.execute',
                  value: 35,
                  selfValue: 35,
                },
              ],
            },
            {
              name: 'Compression.gzip',
              value: 55,
              selfValue: 55,
            },
            {
              name: 'formatLog',
              value: 35,
              selfValue: 35,
            },
          ],
        },
      ],
    },
  ],
}

// Calculate total formatLog samples for the discovery moment
// formatLog appears in: authenticate(30), Session.lookup(5), Validator.schema(10), 
// Permissions.check(10), Avatar.resize(10), Cache.set(15), Response.send(35) = 115 total = 11.5%
// This is the "hidden bottleneck" - logging is everywhere and adds up!
